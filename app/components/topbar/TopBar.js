/**
 * @class fcaTopBar
 * @memberOf FSCounterAggregatorApp
 * @description Manage the topbar data
 */
(function () {
  angular.module('FSCounterAggregatorApp').directive('fcaTopBar', [
    'LegacyUserService',
    function (
      LegacyUserService
    ) {
      return {
        link: function (scope, element, attr) {
          scope.params = LegacyUserService;
          scope.user = undefined;

          LegacyUserService.getSettings()
            .then(function (ret) {
              scope.user = ret.user;
            });

          scope.$watch('params.currentUserData', function (newVal, oldVal) {
            if (oldVal != newVal) {
              scope.user = newVal.user;
            }
          });

        },
        templateUrl: 'build/html/TopBarView.html'
      };
    }]);

}());
