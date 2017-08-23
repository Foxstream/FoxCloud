/**
 * @class SettingsSites
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages sites
 * require administrator rights
 */
(function () {

  require('../services/SiteService');

  angular.module('FSCounterAggregatorApp').controller('SettingsSites', [
    '$scope',
    '$timeout',
    '$compile',
    'SiteService',
    'DTOptionsBuilder',
    'DTColumnDefBuilder',
    function (
      $scope,
      $timeout,
      $compile,
      SiteService,
      DTOptionsBuilder,
      DTColumnDefBuilder
    ) {

      var SiteResources = SiteService.getResource();

      $scope.selectAll = false;
      $scope.selectedLength = 0;
      $scope.selectedElts = {};
      $scope.site = undefined;
      $scope.isNewSite = false;
      $scope.isEditionMode = false;

      $scope.dtInstance = {};

      $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [[1, "asc"]])
        .withBootstrap();

      $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2).notSortable()
      ];

      $scope.toggleAll = function () {
        $scope.selectAll = !$scope.selectAll;
        for (var key in $scope.selectedElts) {
          $scope.selectedElts[key].selected = $scope.selectAll;
        }
        $scope.selectedLength = $scope.selectAll ? $scope.sites.length : 0;
      };

      $scope.toggleOne = function (id) {
        if ($scope.selectedElts[id].selected) {
          $scope.selectedLength++;
          $scope.selectAll = $scope.selectedLength == $scope.sites.length;
        } else {
          $scope.selectedLength--;
          $scope.selectAll = false;
        }
      };

      $scope.switchToEditionMode = function () {
        $scope.isEditionMode = true;
      };

      $scope.switchToListMode = function () {
        $scope.isEditionMode = false;
        $scope.site = undefined;
      };

      $scope.newSite = function () {
        $scope.switchToEditionMode();
        $scope.isNewSite = true;
        $scope.site = new SiteResources({
          name: "",
          usersadmin: [],
          users: [],
          items: []
        });
      };

      $scope.editSite = function (site) {
        $scope.switchToEditionMode();
        $scope.isNewSite = false;
        $scope.site = site;
      };

      $scope.saveSite = function () {
        if (!$scope.isNewSite) {
          $scope.site.$save();
        } else {
          $scope.site.$create()
            .then(function () {
              $scope.sites.push($scope.site);
              $scope.selectedElts[$scope.site._id] = {
                'selected': false,
                'site': $scope.site
              };
              $scope.selectAll = $scope.selectedLength === $scope.sites.length;
              $scope.site = undefined; // clear to force the editor to update
            });
        }
      };

      $scope.deleteSite = function (site) {
        removeSiteFromArray(site);
        site.$delete();
      };

      $scope.deleteSelectedSites = function () {
        for (var key in $scope.selectedElts) {
          if ($scope.selectedElts[key].selected) {
            $scope.deleteSite($scope.selectedElts[key].site);
          }
        }
      };

      function initScope() {
        $scope.sites = SiteResources.query(function () {

          for (var i = 0; i < $scope.sites.length; ++i) {
            $scope.selectedElts[$scope.sites[i]._id] = {
              'selected': false,
              'site': $scope.sites[i]
            };
          }

        });
      }

      function removeSiteFromArray(site) {
        var pos = $scope.sites.indexOf(site);
        $scope.sites.splice(pos, 1);
        if ($scope.selectedElts[site._id].selected) {
          $scope.selectedLength--;
        }
        delete $scope.selectedElts[site._id];
        $scope.selectAll = $scope.selectedLength === $scope.sites.length;
      }

      initScope();

    }]);
})();
