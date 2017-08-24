/**
 * @class SettingsSiteItems
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages the association between cameras and sites
 */

(function () {
  angular.module('FSCounterAggregatorApp').controller('SettingsSiteItems', [
    '$scope',
    '$compile',
    '$q',
    '$stateParams',
    'LegacyUserService',
    'SiteService',
    'DTOptionsBuilder',
    'DTColumnDefBuilder',
    function (
      $scope,
      $compile,
      $q,
      $stateParams,
      LegacyUserService,
      SiteService,
      DTOptionsBuilder,
      DTColumnDefBuilder
    ) {

      // items connected to the current selected site
      $scope.items = [];
      $scope.itemsFull = undefined; // detailed info for items

      $scope.selectAll = false;
      $scope.selectedLength = 0;
      $scope.selectedElts = {};
      $scope.selectedElt = undefined;

      $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('order', [[1, "asc"]])
        .withBootstrap();

      $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(5).notSortable()
      ];

      $scope.toggleAll = function () {
        $scope.selectAll = !$scope.selectAll;
        for (var key in $scope.selectedElts) {
          $scope.selectedElts[key].selected = $scope.selectAll;
        }
        $scope.selectedLength = $scope.selectAll ? $scope.items.length : 0;
      };

      $scope.toggleOne = function (id) {
        if ($scope.selectedElts[id].selected) {
          $scope.selectedLength++;
          $scope.selectAll = $scope.selectedLength === $scope.items.length;
        } else {
          $scope.selectedLength--;
          $scope.selectAll = false;
        }
      };

      $scope.update = function () {
        $scope.items = $scope.selectedElt.items;
        $scope.selectedElts = {};
        $scope.selectedLength = 0;
        $scope.selectAll = false;

        for (var i = 0; i < $scope.items.length; ++i) {
          var item = $scope.items[i];
          $scope.selectedElts[item._id] = {
            selected: false,
            item: $scope.items[i]
          };
        }

        // user settings contains only items id and name
        // retrieve all other information from the site settings
        SiteService.getItems($scope.selectedElt._id, $scope.items)
          .then(function (itemsFull) {
            $scope.itemsFull = itemsFull;
          });
      };

      $scope.selectElt = function (elt) {
        $scope.selectedElt = elt;
        $scope.update();
      };

      $scope.addItem = function () {
        SiteService.addItem($scope.selectedElt._id)
          .then(function (ret) {
            $scope.selectElt(ret);
          });
      };

      $scope.removeItem = function (item) {
        removeItemFromArray(item);
        SiteService.removeItem($scope.selectedElt._id, item._id)
          .then(function (ret) {
            $scope.selectElt(ret);
          });
      };

      $scope.unlinkItem = function (item) {
        SiteService.unlinkItem($scope.selectedElt._id, item._id)
          .then(function (ret) {
            $scope.selectElt(ret);
          });
      };

      $scope.unlinkSelectedItems = function () {
        for (var key in $scope.selectedElts) {
          if ($scope.selectedElts[key].selected) {
            $scope.unlinkItem($scope.selectedElts[key].item);
          }
        }
      };

      $scope.removeSelectedItems = function () {
        var promises = [];
        for (var key in $scope.selectedElts) {
          if ($scope.selectedElts[key].selected) {
            promises.push(SiteService.removeItem($scope.selectedElt._id,
              $scope.selectedElts[key].item._id));
          }
        }
        $q.all(promises)
          .then(function (ret) {
            $scope.update();
          });
      };

      function removeItemFromArray(item) {
        var pos = $scope.items.indexOf(item);
        $scope.items.splice(pos, 1);
        if ($scope.selectedElts[item._id].selected) {
          $scope.selectedLength--;
        }
        delete $scope.selectedElts[item._id];
        $scope.selectAll = $scope.selectedLength === $scope.items.length;
      }

      function initScope() {
        // optionally initial site selection could be choosen from the $route
        LegacyUserService.getSettings()
          .then(function (userData) {
            if ($stateParams.siteId !== undefined) {
              var site = LegacyUserService.getSiteFromId(userData.sites,
                $stateParams.siteId);
              if (site !== undefined && site.isadmin) {
                $scope.selectedElt = site;
              }
            } else {
              $scope.selectedElt = LegacyUserService.getFirstSiteAdmin(userData.sites);
            }
            $scope.sites = userData.sites;
            $scope.update();
          });
      }

      initScope();
    }]);
}());
