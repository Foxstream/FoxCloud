/**
 * @class fcaSideMenu
 * @memberOf FSCounterAggregatorApp
 * @description Menu used to select dashboards
 */
(function () {

	require('../../services/user-service');

	angular.module('FSCounterAggregatorApp')
		.directive('fcaSideMenu', [
			'LayoutService',
			'UserService',
			function (
				LayoutService,
				UserService
			) {
				return {
					link: function (scope, element, attr) {

						scope.user = {};
						scope.hasAdminSites = false;
						scope.hasUserDashboard = false;

						LayoutService.init();

						function updateRights(data) {
							var currentUserSites = data.sites;
							scope.hasAdminSites = false;
							for (var i = 0; i < currentUserSites.length; ++i) {
								if (currentUserSites[i].isadmin) {
									scope.hasAdminSites = true;
									break;
								}
							}
							scope.hasUserDashboard = data.user.userInfo && data.user.userInfo.dashboard && data.user.userInfo.dashboard.length > 0;
						}

						UserService.getSettings()
							.then(function (ret) {
								scope.user = ret.user;
								updateRights(ret);
							});

						scope.$watch('UserService.currentUserData', function (newVal) {
							if (newVal) {
								scope.user = newVal.user;
								updateRights(newVal);
							}
						});
					},
					templateUrl: 'build/html/SideMenuView.html'
				};
			}]);
}());
