/*
 * Manage the dashboard data
 **/

(function(){

    require('../../services/DashboardParamsService');
    
    angular.module('FSCounterAggregatorApp').controller('DashboardController', [
	'$scope',
	'DashboardParamsService',	
	function(
	    $scope,
	    DashboardParamsService
	) {	   
	    $scope.params = DashboardParamsService;
	    
	    $scope.params.loadParams().then(function() {
		$scope.params.loadData();
	    });

	    $scope.switchTimeZone = function() {
		$scope.params.useTimeZone = !$scope.params.useTimeZone;
		$scope.params.reloadData();
	    };
	    
	    /*
	    $scope.$watch('params.period', function(newPeriod, oldPeriod) {
		if(newPeriod !== oldPeriod) {
		    $scope.params.loadData();
		}
	    });
	    */

	    $scope.exportPrint = function() {
		window.print();
	    };

	}]);

}());
