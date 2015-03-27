angular
	.module('game.ui.main-menu.login', [
		'ui.router'
	])
	.config(['$stateProvider', function ($stateProvider) {
		'use strict';

		$stateProvider.state('main-menu.login', {
			templateUrl: 'client/game/ui/main-menu/login/login.ng.html',
			controller: ['$scope', '$state', function ($scope, $state) {

				$scope.login = function() {
					// GameService.enterGame($scope.nickname);
				};

				$scope.cancel = function () {
					$state.go('main-menu.enter-world');
				}
			}]
		});
	}]);
