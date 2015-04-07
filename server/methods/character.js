'use strict';

var validator = Meteor.npmRequire('validator');

Meteor.methods({
  createChar: function (options) {

  	var user = Meteor.user();

	var charCount = Entities.find({
		owner: user._id
	}).count();

	if (user.profile && user.profile.guest) {
		if (charCount >= 1) {
			// Just return the characterId we already have on file
			return Entities.findOne({owner:user._id})._id;
		}
	}
	else {
		if (charCount >= ironbaneConstants.rules.maxCharactersAllowed) {
			throw new Meteor.Error('tooManyChars', 'You\'ve reached the limit of characters you can create.');
		}
	}

  	options = options || {};

  	if (!options.charName) {
  		throw new Meteor.Error('noCharNameGiven', 'Enter a character name.');
  	}

  	options.charName = options.charName || 'Guest';
  	options.boy = !_.isUndefined(options.boy) ? options.boy : (_.random(1, 2) === 1 ? true : false);
  	options.boy = options.boy ? 'male' : 'female';
  	options.skin = options.skin || _.sample(ironbaneConstants.characterParts[options.boy].skin);
  	options.eyes = options.eyes || _.sample(ironbaneConstants.characterParts[options.boy].eyes);
  	options.hair = options.hair || _.sample(ironbaneConstants.characterParts[options.boy].hair);

	var charName = options.charName;

	if (!validator.isAlphanumeric(charName)) {
		throw new Meteor.Error('charAlphanumeric', 'Character name can only have letters and numbers.');
	}

	if (!charName || charName.length < ironbaneConstants.rules.minCharNameLength ||
		charName.length > ironbaneConstants.rules.maxCharNameLength) {
		throw new Meteor.Error('charNameLength', 'Character name must be between ' +
			ironbaneConstants.rules.minCharNameLength + ' and ' +
			ironbaneConstants.rules.maxCharNameLength + ' chars.');
	}

	// Check if this character already exists
	// Note that this checks NPC's as well! We probably don't want
	// players to have the same name as an NPC.
	if (Entities.find({
		name: charName
	}).count() !== 0) {
		throw new Meteor.Error('charNameTaken', 'Character name already taken.');
	}

	if (!_.contains(ironbaneConstants.characterParts[options.boy].skin, options.skin) ||
		!_.contains(ironbaneConstants.characterParts[options.boy].eyes, options.eyes) ||
		!_.contains(ironbaneConstants.characterParts[options.boy].hair, options.hair)) {
		throw new Meteor.Error('charAppearance', 'Invalid character appearance.');
	}

	var cheats = {};

 	if (Roles.userIsInRole(user, ['game-master'])) {
    	cheats.jump = true;
    }

	// Insert a new character
	var entityId = Entities.insert({
		owner: user._id,
		name: charName,
		position: ironbaneConstants.world.startPosition,
		rotation: ironbaneConstants.world.startRotation,
		level: ironbaneConstants.world.startLevel,
		cheats: cheats,
		components: {
            quad: {
                transparent: true,
                charBuildData: {
                	skin: options.skin,
                	eyes: options.eyes,
                	hair: options.hair
                }
            },
            rigidBody: {
                shape: {
                    type: 'capsule',
                    width: 0.5,
                    height: 1.0,
                    depth: 0.5,
                    radius: 0.5

                    // type: 'sphere',
                    // radius: 0.5
                },
                mass: 1,
                friction: 0.0,
                restitution: 0,
                allowSleep: false,
                lock: {
                    position: {
                        x: false,
                        y: false,
                        z: false
                    },
                    rotation: {
                        x: true,
                        y: true,
                        z: true
                    }
                }
            },
			'name-mesh': {
				text: charName
			},
            script: {
                scripts: [
                    '/scripts/built-in/sprite-sheet.js',
                ]
            },
            shadow: {},
		}
	}, function (err) {
		if (err) {
			throw err;
		}
	});

	return entityId;
  }
});
