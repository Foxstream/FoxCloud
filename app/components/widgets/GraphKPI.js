/**
 * @class GraphKPI
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying a KPI value from a specific indicator
 **/

require('../../services/WidgetStyleService');

angular.module('FSCounterAggregatorApp').
directive('fcaGraphKpi', function() {
    return {
        scope: {
            params: '=',
            kpi: '=',
            kpiOptions: '=?',
            sitecomparing: '@'
        },
        controller: [
            '$scope',
            'WidgetStyleService',
            '$sce',
            function(
                $scope,
                WidgetStyleService,
                $sce
            ) {

                $scope.showsitecomparing = ($scope.sitecomparing === undefined) || ($scope.sitecomparing === "true");

                //var $injector = angular.injector(['FSCounterAggregatorApp']);
                //var s = $injector.get('WidgetStyleService');
                /*$scope.htmlPopover = $sce.trustAsHtml(
        '<ul>' +
        '<li ng-repeat="option in parent.kpi.options.indicators"> {{option.name}}</li>' +
        '</ul>'
      );*/

                $scope.widgetId = "GraphKPIWidget";
                $scope.sitesSelected = [undefined, undefined];
                /* $scope.chartData = [ {}, {} ]; */
                $scope.chartLegends = [];

                $scope.$watch("params.sites", function(newSites, oldSites) {
                    if (newSites !== undefined && newSites.length) {
                        $scope.sitesSelected[0] = $scope.params.sites[0];
                    }
                });

                $scope.siteComparisonSelected = undefined;
                $scope.periodComparisonSelected = false;
                $scope.periodComparisonMoments = [];
                $scope.periodComparisonLabels = {};

                $scope.style = undefined;
                $scope.countingChartOptions = undefined;
                $scope.countingChartData = undefined;

                $scope.indicatorSelected = {
                    id: $scope.kpi.options.defaultIndicatorId
                };

                $scope.rangeSelected = {
                    id: $scope.kpi.options.defaultRangeId
                };

                $scope.rangesEnabled = {};
                for (var i = 0; i < $scope.kpi.options.ranges.length; ++i) {
                    $scope.rangesEnabled[$scope.kpi.options.ranges[i].id] = true;
                }

                $scope.periodTimeFormat = $scope.kpi.getTimeFormat($scope.params.period,
                    $scope.rangeSelected.id);

                if ($scope.kpiOptions !== undefined) {
                    $scope.kpi.setOptions($scope.kpiOptions);
                }

                /**
                 * When true, set the default value for 2nd site
                 * force comparison to be at minimum by hours
                 * set interactive guideline
                 */
                $scope.toggleSiteComparison = function(open) {
                    $scope.sitesSelected[1] = (open ? ($scope.params.sites[0].id !== $scope.sitesSelected[0].id ?
                        $scope.params.sites[0] : $scope.params.sites[1]) : undefined);
                    //$scope.countingChartOptions.chart.useInteractiveGuideline = open;
                    $scope.updateSelectedRange();
                    $scope.update();
                };

                // todo: update site list regarding the sites
                // delivered by the data provider
                $scope.$watch('params.data', function(newData, oldData) {
                    if (newData !== undefined && newData.length) {
                        //$scope.updateSiteList();
                        $scope.updateSelectedRange();
                        $scope.update();
                    }
                });

                $scope.$watch('params.comparedData', function(newData, oldData) {
                    if (newData !== undefined && newData.length) {
                        $scope.periodComparisonSelected = true;
                    } else if ($scope.periodComparisonSelected) {
                        $scope.periodComparisonSelected = false;
                        $scope.update();
                    }
                });

                $scope.$watch('rangeSelected.id', function(newId, oldId) {
                    if (oldId !== newId) {
                        $scope.update();
                    }
                });

                $scope.updateIndicators = function() {
                    // we update the kpi indicators by using
                    // data on the selected site or from the first returned site
                    if ($scope.params.sites.length > 0 &&
                        $scope.kpi.updateIndicators !== undefined) {

                        var selSite = $scope.sitesSelected.length > 0 ?
                            $scope.sitesSelected[0] : $scope.params.sites[0];

                        var idx = _.findIndex($scope.params.data, {
                            "id": selSite.id
                        });

                        $scope.kpi.updateIndicators($scope.params.data[idx]);

                        if ($scope.indicatorSelected.id === undefined) {
                            $scope.indicatorSelected = {
                                id: $scope.kpi.options.defaultIndicatorId
                            };
                        }

                    }
                };

                $scope.updateSelectedRange = function() {
                    var firstEnabledRange;
                    for (var i = 0; i < $scope.kpi.options.ranges.length; ++i) {
                        var rangeId = $scope.kpi.options.ranges[i].id;
                        var computable =
                            $scope.kpi.isPeriodComputable($scope.params.period,
                                rangeId) &&
                            ($scope.kpi.isPeriodComparable(rangeId) || !$scope.sitesSelected[1]);
                        if (!firstEnabledRange &&
                            computable) {
                            firstEnabledRange = rangeId;
                        }
                        $scope.rangesEnabled[rangeId] = computable;
                    }
                    if (!$scope.rangesEnabled[$scope.rangeSelected.id]) {
                        $scope.rangeSelected.id = firstEnabledRange;
                    }
                };

                $scope.getSiteName = function(id) {
                    var idx = _.findIndex($scope.params.sites, {
                        "id": id
                    });
                    return idx != -1 ? $scope.params.sites[idx].name : undefined;
                };

                function updateOnPeriod(period, data, chartsDataStyle, chartsData, chartsLegends, preKey) {
                    if ($scope.kpi.haveIndicator($scope.indicatorSelected.id)) {
                        for (var i = 0; i < $scope.sitesSelected.length; ++i) {
                            if ($scope.sitesSelected[i] !== undefined) {
                                var idx = _.findIndex(data, {
                                    "id": $scope.sitesSelected[i].id
                                });
                                var res = $scope.kpi.compute({
                                    "sitedata": data[idx].data,
                                    "period": period,
                                    "groupBy": $scope.rangeSelected.id,
                                    "indicator": $scope.indicatorSelected.id
                                });
                                var key = preKey + "_" + $scope.sitesSelected[i].id +
                                    "_" + res.query.indicator;
                                var chartData = angular.extend({
                                        "key": key,
                                        "values": res.data
                                    },
                                    chartsDataStyle[i]);
                                chartsData.push(chartData);
                                var label = $scope.getSiteName($scope.sitesSelected[i].id) +
                                    " - " + $scope.kpi.getIndicatorName(res.query.indicator);
                                chartsLegends.push({
                                    "key": key,
                                    "period": period,
                                    "label": label,
                                    "total": res.value,
                                    "color": chartData.color
                                });
                                $scope.periodComparisonLabels[key] = label;
                            }
                        }
                    }
                }

                function replaceXaxis(dst, src, backup) {
                    var i;
                    if (backup !== undefined) {
                        for (i = 0; i < src.length; ++i) {
                            if (dst[i] !== undefined) {
                                backup[i] = dst[i].x;
                                dst[i].x = src[i].x;
                            } else {
                                backup[i] = src[i].x;
                                dst[i] = {
                                    x: src[i].x,
                                    y: 0
                                };
                            }
                        }
                    } else {
                        for (i = 0; i < src.length; ++i) {
                            if (dst[i] !== undefined) {
                                dst[i].x = src[i].x;
                            } else {
                                dst[i] = {
                                    x: src[i].x,
                                    y: 0
                                };
                            }
                        }
                    }
                }

                $scope.update = function() {

                    WidgetStyleService.getStyle($scope.widgetId).
                    then(function(style) {

                        $scope.setWidgetStyle(style);

                        $scope.updateIndicators();

                        $scope.periodComparisonLabels = {};

                        var chartsData = [];
                        var chartsLegends = [];
                        var chartsLegendsCompared = [];

                        updateOnPeriod($scope.params.period, $scope.params.data, $scope.style.chartData, chartsData, chartsLegends, "");

                        if ($scope.periodComparisonSelected) {

                            updateOnPeriod($scope.params.comparedPeriod, $scope.params.comparedData, $scope.style.chartDataCompared, chartsData, chartsLegendsCompared, "comp");

                            $scope.periodComparisonMoments = [];

                            if ($scope.sitesSelected[1] === undefined) {
                                replaceXaxis(chartsData[1].values, chartsData[0].values, $scope.periodComparisonMoments);
                            } else {
                                replaceXaxis(chartsData[2].values, chartsData[0].values, $scope.periodComparisonMoments);
                                replaceXaxis(chartsData[3].values, chartsData[1].values);
                            }

                            $scope.chartLegendsCompared = chartsLegendsCompared;
                        }

                        $scope.periodTimeFormat = $scope.kpi.getTimeFormat($scope.params.period, $scope.rangeSelected.id);

                        $scope.chartLegends = chartsLegends;
                        $scope.chartLegendsCompared = chartsLegendsCompared;

                        $scope.countingChartOptions = $scope.style.nvd3;
                        $scope.countingChartOptions.chart.xScale = d3.time.scale();
                        $scope.countingChartData = chartsData;
                    });
                };

                $scope.setWidgetStyle = function(style) {
                    $scope.style = style.json;
                    $scope.style.nvd3.chart.xAxis.tickFormat = function(d) {
                        return moment(d).format($scope.periodTimeFormat);
                    };
                    $scope.style.nvd3.chart.yAxis.tickFormat = function(d) {
                        return d3.format('d')(d);
                    };

                    if ($scope.periodComparisonSelected) {

                        var tooltip = nv.models.tooltip();
                        var contentGenerator = tooltip._options.contentGenerator;
                        tooltip._options.keyFormatter = function(d) {
                            return $scope.periodComparisonLabels[d];
                        };

                        $scope.style.nvd3.chart.interactiveLayer.tooltip.contentGenerator = function(d) {

                            // async call pb : called while countingChartData is undefined
                            if (d.series.length === 2 && $scope.sitesSelected[1]) {
                                return false;
                            }

                            return contentGenerator({
                                "value": $scope.kpi.getRangeTimeFormat($scope.rangeSelected.id)(d.value, $scope.params.period),
                                "series": $scope.sitesSelected[1] ? [d.series[0], d.series[1]] : [d.series[0]]
                            }) + contentGenerator({
                                "value": $scope.kpi.getRangeTimeFormat($scope.rangeSelected.id)($scope.periodComparisonMoments[d.index],
                                    $scope.params.period),
                                "series": $scope.sitesSelected[1] ? [d.series[2], d.series[3]] : [d.series[1]]
                            });
                        };

                        $scope.style.nvd3.chart.interactiveLayer.tooltip.headerFormatter = undefined;
                        $scope.style.nvd3.chart.interactiveLayer.tooltip.keyFormatter = undefined;

                    } else {
                        $scope.style.nvd3.chart.interactiveLayer.tooltip.headerFormatter = function(d, i) {
                            return $scope.kpi.getRangeTimeFormat($scope.rangeSelected.id)(d, $scope.params.period);
                        };
                        $scope.style.nvd3.chart.interactiveLayer.tooltip.keyFormatter = function(d, i) {
                            return $scope.chartLegends[i] ? $scope.chartLegends[i].label : "";
                        };
                        $scope.style.nvd3.chart.interactiveLayer.tooltip.contentGenerator = undefined;
                    }

                    $scope.countingCharOptions = undefined;
                    $scope.countingChartData = undefined;

                };
            }
        ],
        link: function(scope, element, attr) {},
        templateUrl: 'build/html/GraphKPIView.html'
    };
});
