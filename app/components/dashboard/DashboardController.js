/*
 * Manage the dashboard data
 **/

(function() {

    require('../services/DashboardParamsService');
    require('../services/ExportService');

    angular.module('FSCounterAggregatorApp').controller('DashboardController', [
        '$scope',
        'DashboardParamsService',
        'ExportService',
        function(
            $scope,
            DashboardParamsService,
            ExportService
        ) {
            $scope.params = DashboardParamsService;

            $scope.params.loadParams().then(function() {
                $scope.params.loadData();
            });

            $scope.switchTimeZone = function() {
                $scope.params.useTimeZone = !$scope.params.useTimeZone;
                $scope.params.reloadData();
            };

            $scope.exportCurrentData = function() {
                var dateFormat = "YYYY-MM-DD";
                var fileName = "RawData_" + $scope.params.period.startDate.format(dateFormat) +
                    "__" + $scope.params.period.endDate.format(dateFormat) + ".csv";
                var csvData = ExportService.ConvertDataToCSV($scope.params.data, $scope.params.sites);
                ExportService.ProposeToDownload(csvData, fileName, 'text/csv;encoding:utf-8');
            };
        }
    ]);

}());