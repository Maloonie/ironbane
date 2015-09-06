angular
    .module('game.ui.inventoryBar', [
        'game.world-root'
    ])
    .directive('inventoryBar', [
        '$log',
        '$rootWorld',
        '$q',
        function($log, $rootWorld, $q) {
            'use strict';

            var config = {
                restrict: 'E',
                templateUrl: 'client/game/ui/inventoryBar/inventoryBar.ng.html',
                scope: {
                    entity: '=' // this can be anything with inventory, player, bag, mob, magic hat, etc.
                },
                bindToController: true,
                controllerAs: 'inventoryBar',
                controller: ['$scope', function($scope) {

                    var ctrl = this,
                        inventorySystem = $rootWorld.getSystem('inventory'),
                        onChange;


                    var slotDefs = [
                        {
                            name: 'head',
                            backgrounds: [[0,2],[0,0]]
                        },
                        {
                            name: 'body',
                            backgrounds: [[2,2],[0,0]]
                        },
                        {
                            name: 'feet',
                            backgrounds: [[1,2],[0,0]]
                        },
                        {
                            name: 'rhand',
                            backgrounds: [[0,1],[0,0]]
                        },
                        {
                            name: 'lhand',
                            backgrounds: [[0,1],[0,0]]
                        },
                        {
                            name: 'relic1',
                            backgrounds: [[1,1],[1,0]]
                        },
                        {
                            name: 'relic2',
                            backgrounds: [[1,1],[1,0]]
                        },
                        {
                            name: 'relic3',
                            backgrounds: [[1,1],[1,0]]
                        },
                        // TODO: other than player, quickslot numbers would NOT show up!
                        {
                            name: 'slot0',
                            backgrounds: [[0,3], [2,0]]
                        },
                        {
                            name: 'slot1',
                            backgrounds: [[1,3], [2,0]]
                        },
                        {
                            name: 'slot2',
                            backgrounds: [[2,3], [2,0]]
                        },
                        {
                            name: 'slot3',
                            backgrounds: [[3,3], [2,0]]
                        },
                        {
                            name: 'slot4',
                            backgrounds: [[0,4], [2,0]]
                        },
                        {
                            name: 'slot5',
                            backgrounds: [[1,4], [2,0]]
                        },
                        {
                            name: 'slot6',
                            backgrounds: [[2,4], [2,0]]
                        },
                        {
                            name: 'slot7',
                            backgrounds: [[3,4], [2,0]]
                        },
                        {
                            name: 'slot8',
                            backgrounds: [[4,4], [2,0]]
                        },
                        {
                            name: 'slot9',
                            backgrounds: [[0,5], [2,0]]
                        },
                        {
                            name: 'slot10',
                            backgrounds: [[1,5], [2,0]]
                        },
                    ],
                    validSlotNames = /head|body|feet|rhand|lhand|relic*|slot*/;

                    slotDefs = _.map(slotDefs, function(slot) {
                        var cssBackgrounds = [];
                        slot.backgrounds.forEach(function (bg) {
                            bg[0] *= -32;
                            bg[1] *= -32;
                            cssBackgrounds.push(bg.join('px ') + 'px');
                        });
                        slot.cssStyle = {
                            'background-position': cssBackgrounds.join(',')
                        };

                        $scope['onDrop' + slot.name] = function (e, obj) {
                            var deferred = $q.defer();
                            if (obj.draggable) {
                                var targetSlot = slot.name;
                                var sourceSlot = obj.draggable.context.attributes['data-slot'].value;
                                var result = inventorySystem.equipItem(ctrl.entity, sourceSlot, targetSlot);
                                if (result) {
                                    deferred.resolve();
                                }
                                else {
                                    deferred.reject();
                                }
                            }
                            return deferred.promise;
                        };

                        return slot;
                    });

                    onChange = function(entity) {
                        if (entity.id !== ctrl.entity.id) {
                            return;
                        }

                        var inventory = entity.getComponent('inventory'),
                            availableSlots = _.filter(Object.keys(inventory), function(name) { return name.match(validSlotNames); });

                        //$log.debug('entity inv: ', inventory, availableSlots);

                        ctrl.slots = _.map(availableSlots, function(slotName) {
                            var slot = _.findWhere(slotDefs, {name: slotName});
                            slot.item = inventory[slotName];

                            return slot;
                        });

                        //$log.debug('available slots for entity: ', ctrl.slots);
                    };

                    // any change we need to re-assess the inventory UI
                    inventorySystem.onEquipItem.add(onChange);
                    inventorySystem.onUnEquipItem.add(onChange);
                    inventorySystem.onItemAdded.add(onChange);
                    inventorySystem.onItemRemoved.add(onChange);

                    $scope.$watch(function() {
                        return ctrl.entity;
                    }, function(entity) {
                        if(!entity) {
                            return;
                        }
                        onChange(entity);
                    });

                    ctrl.use = function(slot) {
                        // for now just equip/unequip
                        if (slot.item && slot.name.match(/slot*/)) {
                            inventorySystem.equipItem(ctrl.entity, slot.name);
                        } else {
                            inventorySystem.unequipItem(ctrl.entity, slot.name);
                        }
                    };
                }]
            };

            return config;
        }
    ]);
