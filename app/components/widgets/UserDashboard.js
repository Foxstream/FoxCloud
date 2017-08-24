/**
 * @class fcaUserDashboard
 * @memberOf FSCounterAggregatorApp
 * @description Manage the user defined dashboard
 */
angular.module('FSCounterAggregatorApp').directive('fcaUserDashboard', [
  'LegacyUserService',
  '$compile',
  function (
    LegacyUserService,
    $compile
  ) {
    return {
      scope: {
        params: '='
      },
      link: function (scope, element, attr) {
        function updateDashboard(user) {
          element.html(user.userInfo.dashboard).show();
          $compile(element.contents())(scope);
        }

        LegacyUserService.getSettings()
          .then(function (ret) {
            updateDashboard(ret.user);
          });

        scope.$watch('params.currentUserdata', function (newVal, oldVal) {
          if (oldVal !== newVal) {
            updateDashboard(newVal.user);
          }
        });
      }
    };
  }]
);
