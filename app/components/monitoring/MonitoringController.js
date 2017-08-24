/**
 * @class MonitoringController
 * @memberOf FSCounterAggregatorApp
 * @description Handle data to display for displaying the last data upload
 */
(function () {
  angular.module('FSCounterAggregatorApp').controller('MonitoringController', [
    '$scope',
    'LegacyUserService',
    'DTOptionsBuilder',
    function (
      $scope,
      LegacyUserService,
      DTOptionsBuilder
    ) {
      function buildTableWithLatestData(userSettings) {
        if (userSettings && userSettings.sites)
          $scope.itemData = _.flatten(_.map(userSettings.sites, function (site) {
            return _.map(site.items, function (item) {
              return {
                SiteName: site.name,
                ItemName: item.name,
                LastUploadTime: item.lastUpdateTime,
                LastUploadTimeStr: moment(item.lastUpdateTime).format("Do MMMM YYYY, HH:mm:ss"),
                Duration: moment().diff(moment(item.lastUpdateTime)),
                DurationStr: moment(item.lastUpdateTime).toNow(true)
              };
            });
          }));
        else
          $scope.itemData = [];
      }

      $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withBootstrap();

      $scope.DangerDuration = 1000 * 60 * 60 * 24 * 3; //3 days
      LegacyUserService.getSettings().then(buildTableWithLatestData);
    }]);
}());
