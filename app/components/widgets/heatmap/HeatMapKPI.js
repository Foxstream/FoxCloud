/**
 * @class GraphKPI
 * @memberof FSCounterAggregatorApp
 * @description Widget implementation for displaying a KPI value from a specific indicator
 **/

import { TextureLoader } from 'three';

require('../../services/WidgetStyleService');

import { HeatMapRenderer } from './HeatMapRenderer';

angular.module('FSCounterAggregatorApp').
    directive('fcaHeatMapKpi', function () {
        return {
            scope: {
                params: '=',
                kpi: '=?',
                kpiOptions: '=?'
            },
            controller: [
                '$scope',
                'WidgetStyleService',
                'DataService',
                function (
                    $scope,
                    WidgetStyleService,
                    DataService                
                ) {

                    let textureLoader = new TextureLoader();

                    $scope.widgetId = "HeatMapKPIWidget";
                    $scope.siteSelected = undefined;                    

                    $scope.scales = {
                        imgs: [ // gradient images size 128x32
                            "assets/img/default-gradient.png",
                            "assets/img/deep-sea-gradient.png",
                            "assets/img/skyline-gradient.png"
                        ],
                        selected: 0
                    };

                    $scope.opacities = {
                        values: [
                            0.3,
                            0.5,
                            0.8
                        ],
                        selected: 1
                    };

                    $scope.$watch("params.sites", function (newSites, oldSites) {
                        if (newSites !== undefined && newSites.length) {
                            $scope.siteSelected = $scope.params.sites[0];
                        }
                    });

                    $scope.periodComparisonSelected = false;
                    $scope.heatmapVisible = 0;

                    $scope.style = undefined;

                    $scope.$watch('params.data', function (newData, oldData) {
                        if (newData !== undefined && newData.length) {
                            $scope.update();
                        }
                    });

                    $scope.$watch('params.comparedData', function (newData, oldData) {
                        if (newData !== undefined && newData.length) {
                            $scope.periodComparisonSelected = true;
                        } else if ($scope.periodComparisonSelected) {
                            $scope.periodComparisonSelected = false;
                            $scope.heatmapVisible = 0;
                            $scope.update();
                        }
                    });

                    $scope.$watch('heatmapVisible', function (newV, oldV) {
                        if (oldV !== newV) {
                            $scope.renderer.setHeatMapVisible(0, newV === 0);
                            $scope.renderer.setHeatMapVisible(1, newV === 1);
                        }
                    });

                    $scope.switchScale = () => {
                        $scope.scales.selected = ($scope.scales.selected + 1) % $scope.scales.imgs.length;
                        $scope.renderer.setGradient(textureLoader.load($scope.scales.imgs[$scope.scales.selected]));                        
                    };

                    $scope.switchOpacity = () => {
                        $scope.opacities.selected = ($scope.opacities.selected + 1) % $scope.opacities.values.length;
                        $scope.renderer.setOpacity($scope.opacities.values[$scope.opacities.selected]);
                    };                    

                    $scope.zoomIn = () => {
                        $scope.renderer.zoomIn(0.3);
                    };

                    $scope.zoomOut = () => {
                        $scope.renderer.zoomOut(0.3);
                    };

                    $scope.zoomReset = () => {
                        $scope.renderer.zoomReset();
                    }

                    $scope.siteSelectedChanged = () => {
                        $scope.renderer.resetControls();
                        $scope.update();
                    };

                    $scope.update = function () {

                        $scope.renderer.removeAllHeatMap();

                        if (!$scope.siteSelected || !$scope.siteSelected.siteInfo || !$scope.siteSelected.siteInfo.heatmap) {
                            return false;
                        }

                        textureLoader.load($scope.siteSelected.siteInfo.heatmap.map,
                            (texture) => {

                                $scope.renderer.setViewport(texture.image.width, texture.image.height, texture);

                                DataService.getFakeHeatMapData($scope.siteSelected.siteInfo.heatmap)
                                    .then((data) => {

                                        // randomize data
                                        data = data.map(elt => elt.map(e => e + 0.2 * e * Math.random()));

                                        textureLoader.load($scope.scales.imgs[$scope.scales.selected],
                                            (gradientTexture) => {
                                                $scope.renderer.addHeatMap(data, 255, gradientTexture);
                                                $scope.renderer.setHeatMapVisible(0, $scope.heatmapVisible === 0);

                                                if ($scope.periodComparisonSelected) {

                                                    let compData = data.map((elt) => {
                                                        return elt.map(e => e + 0.2 * e * Math.random());
                                                    });

                                                    $scope.renderer.addHeatMap(compData, 255, gradientTexture);
                                                    $scope.renderer.setHeatMapVisible(1, $scope.heatmapVisible === 1);
                                                }

                                                $scope.renderer.setOpacity($scope.opacities.values[$scope.opacities.selected]);

                                            });
                                    });
                            });
                    };

                }],
            link: function (scope, elm, attr) {
                var elts = angular.element(elm).find("#heatmap-renderer");
                scope.domRenderer = elts[0];
                scope.renderer = new HeatMapRenderer(scope.domRenderer, {});
                requestAnimationFrame(animate);

                function animate() {
                    scope.$evalAsync(function () {
                        requestAnimationFrame(animate);
                        scope.renderer.onSurfaceChanged();
                        scope.renderer.onDrawFrame();
                    });
                }
            },
            templateUrl: 'build/html/heatmap/HeatMapKPIView.html'
        };
    });

