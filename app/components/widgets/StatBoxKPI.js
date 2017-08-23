/**
 * @class StatBoxKPI
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying a KPI value from a specific indicator
 **/

require('../../services/WidgetStyleService');

angular.module('FSCounterAggregatorApp').
    directive('fcaStatBoxKpi', function(){
	return {
	    scope: {
		indicator: '@',
		label: '@?',
        description: '@?',
        period:'@?',
        unit: '@?',
		params: '=',
		kpi: '=',
		icon: '@?',
		displayFilters: '@?'
	    },
	    controller: [
		'$scope',
		'$filter',
		'WidgetStyleService',
		function(
		    $scope,
		    $filter,
		    WidgetStyleService
		) {
		    function applyFilters(value)
		    {
			if(!$scope.displayFilters)
			    return value;

			return $filter($scope.displayFilters)(value);
		    }

		    $scope.label = $scope.label !== undefined ? $scope.label :
			$scope.kpi.getLabel($scope.indicator);
		    $scope.value = 0;
		    $scope.valueCompared = 0;
		    $scope.widgetId = 'statbox/' + $scope.kpi + '/' + $scope.indicator;

		    $scope.periodComparisonSelected = false;
		    
		    WidgetStyleService.getStyle($scope.widgetId)
			.then(function(data) {
			});

		    $scope.$watch('params.data', function(newData, oldData) {
			if(newData !== oldData) {
			    $scope.update();
			}
		    });

		    $scope.$watch('params.comparedData', function(newData, oldData) {
			if(newData !== undefined && newData.length) {
			    $scope.periodComparisonSelected = true;
			    $scope.updateCompared();
			} else if($scope.periodComparisonSelected) {
			    $scope.periodComparisonSelected = false;
			}
		    });

		    function getValue(data, period, indicator) {
			var res = $scope.kpi.compute({ allsitedata : data,
						       period: period,
						       indicator: indicator,
						       omitTable: true });
			return applyFilters(res.value);
		    }
		    
		    $scope.update = function() {
			$scope.value = getValue($scope.params.data,
						$scope.params.period,
						$scope.indicator);
		    };

		    $scope.updateCompared = function() {
			if($scope.periodComparisonSelected) {
			    $scope.valueCompared = getValue($scope.params.comparedData,
							    $scope.params.comparedPeriod,
							    $scope.indicator);
			}
		    };
		    
		    
		}],
	    link: function(scope, element, attr) {
		scope.icon = scope.icon !== undefined ? scope.icon : 'ion-ios-download';
	    },
	    templateUrl: 'build/html/StatBoxKPIView.html'
	};
    });
