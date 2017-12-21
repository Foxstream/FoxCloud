/**
* @class TableKPI
* @memberof FSCounterAggregatorApp
* @description Widget implementation for displaying statistics in a tabular format
**/

require('../services/WidgetStyleService');

angular.module('FSCounterAggregatorApp').directive('fcaTableKpi', function() {
    return {
        scope: {
            params: '=',
            kpi: '=',
            kpiOptions: '=?',
            showItems: '@'
        },
        controller: [
            '$scope',
            '$q',
            '$controller',
            'WidgetStyleService',
            'DTOptionsBuilder',
            function($scope, $q, $controller, WidgetStyleService, DTOptionsBuilder) {
                $scope.widgetId = "TableKPIWidget";
                $scope.indicators = $scope.kpi.options.indicators;
                $scope.rows = [];
                $scope.total = {};
                $scope.showItems = $scope.showItems === "true";
                $scope.periodComparisonSelected = false;
                $scope.itemsList = [];

                $scope.dtOptions = DTOptionsBuilder.newOptions().withBootstrap();

                if ($scope.kpiOptions !== undefined) {
                    $scope.kpi.setOptions($scope.kpiOptions);
                }

                $scope.$on('event:dataTableLoaded', function(event, loadedDT) {
                    // loadedDT === {"id": "foobar", "DataTable": oTable, "dataTable": $oTable}
                    // loadedDT.DataTable is the DataTable API instance
                    // loadedDT.dataTable is the jQuery Object
                    // See http://datatables.net/manual/api#Accessing-the-API
                    loadedDT.dataTable.rowGrouping();
                });                          

                $scope.$watch('params.data', function(newData, oldData) {
                    if (newData !== undefined && newData.length && newData !== oldData) {                        
                        $scope.update();
                    }
                });

                $scope.$watch("params.sites", function (newSites, oldSites) {
                    if (newSites !== undefined && newSites.length) {                        
                        $scope.itemsList = WidgetStyleService.buildItemsList(newSites, $scope.showItems);
                    }
                });

                $scope.$watch('params.comparedData', function(newData, oldData) {
                    if (newData !== undefined && newData.length && newData !== oldData) {
                        $scope.periodComparisonSelected = true;
                    } else if ($scope.periodComparisonSelected) {
                        $scope.periodComparisonSelected = false;
                        $scope.update();
                    }
                });

                $scope.updateIndicators = function() {
                    if ($scope.itemsList.length > 0 && $scope.kpi.updateIndicators !== undefined) {
                        var idx = _.findIndex($scope.params.data, {"id": $scope.itemsList[0].id});
                        $scope.kpi.updateIndicators($scope.params.data[idx]);
                    }
                };

                $scope.updateTotal = function() {
                    var indicators = $scope.indicators;
                    var newTotal = {};
                    for (var i = 0; i < indicators.length; ++i) {
                        var res = $scope.kpi.compute({
                            "indicator": indicators[i].id,
                            "sitedata": {
                                "id": "total",
                                "data": $scope.rows
                                            .filter(row => $scope.params.sites
                                                .find(site => row.id === site.id))
                            }
                        });
                        newTotal[indicators[i].id] = res.value;
                    }
                    $scope.total = newTotal;
                };

                $scope.updateSites = function() {
                    var newTableRows = [];
                    var indicators = $scope.indicators;
                    var idx,
                        res,
                        j;
                    for (var i = 0; i < $scope.itemsList.length; ++i) {
                        var rowSite = {
                            "name": $scope.itemsList[i].name,
                            "period": $scope.params.period,
                            "id": $scope.itemsList[i].id
                        };
                        for (j = 0; j < indicators.length; ++j) {
                            idx = _.findIndex($scope.params.data, {"id": $scope.itemsList[i].id});
                            res = $scope.kpi.compute({"indicator": indicators[j].id, "sitedata": $scope.params.data[idx]});
                            rowSite[indicators[j].id] = res.value;
                        }
                        newTableRows.push(rowSite);
                        if ($scope.periodComparisonSelected) {
                            rowSite = {
                                "name": $scope.itemsList[i].name,
                                "period": $scope.params.comparedPeriod,
                                "id": $scope.itemsList[i].id,
                                "comparedPeriod": true
                            };
                            for (j = 0; j < indicators.length; ++j) {
                                idx = _.findIndex($scope.params.comparedData, {"id": $scope.itemsList[i].id});
                                res = $scope.kpi.compute({"indicator": indicators[j].id, "sitedata": $scope.params.comparedData[idx]});
                                rowSite[indicators[j].id] = res.value;
                            }
                            newTableRows.push(rowSite);
                        }
                    }
                    $scope.rows = newTableRows;
                };

                $scope.update = function() {

                    WidgetStyleService.getStyle($scope.widgetId).then(function(style) {
                        $scope.setWidgetStyle(style);
                        $scope.updateIndicators();
                        $scope.updateSites();
                        if (!$scope.periodComparisonSelected) {
                            $scope.updateTotal();
                        }
                    });
                };

                $scope.setWidgetStyle = function(style) {
                    if (style.json !== undefined && style.json.dtOptions !== undefined) {
                        //$scope.dtOptions = $q.when(style.json.dtOptions);
                    }
                };
            }
        ],
        templateUrl: 'build/html/TableKPIView.html'
    };
});
