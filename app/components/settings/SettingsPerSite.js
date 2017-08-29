/**
 * @class SettingsPerSite
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages single site
 * require administrator rights
 */
(function () {

  require('../../services/legacy-site-service');

  angular.module('FSCounterAggregatorApp').controller('SettingsPerSite', [
    '$scope',
    '$compile',
    '$stateParams',
    'LegacySiteService',
    'DTOptionsBuilder',
    'DTColumnDefBuilder',
    function (
      $scope,
      $compile,
      $stateParams,
      LegacySiteService,
      DTOptionsBuilder,
      DTColumnDefBuilder
    ) {

      var SiteResources = LegacySiteService.getResource();

      // users connected to the current selected site
      $scope.users = [];
      $scope.usersadmin = [];
      $scope.allUsers = []; // users + usersadmin

      $scope.selectAll = false;
      $scope.selectedLength = 0;
      $scope.selectedElts = {};
      $scope.selectedElt = undefined; // current selected element (site)
      // used to share data between listmode & editionmode
      $scope.user = undefined;
      $scope.isEditionMode = false;

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
        $scope.selectedLength = $scope.selectAll ? $scope.allUsers.length : 0;
      };

      $scope.toggleOne = function (id) {
        if ($scope.selectedElts[id].selected) {
          $scope.selectedLength++;
          $scope.selectAll = $scope.selectedLength === $scope.allUsers.length;
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
      };

      $scope.selectElt = function (elt) {
        $scope.selectedElt = elt;
        $scope.update();
      };

      $scope.addUser = function () {
        $scope.switchToEditionMode();
        $scope.user = {email: ""};
      };

      $scope.saveUser = function () {
        $scope.usersadmin.push($scope.user.email);
        $scope.allUsers = _.union($scope.users, $scope.usersadmin);
        $scope.selectedElt.$save();
        $scope.selectedElts[$scope.user.email] = {
          'selected': false,
          'isAdmin': true
        };
        $scope.selectAll = $scope.selectedLength === $scope.allUsers.length;
      };

      $scope.update = function () {
        $scope.users = $scope.selectedElt.users;
        $scope.usersadmin = $scope.selectedElt.usersadmin;
        $scope.allUsers = _.union($scope.users, $scope.usersadmin);
        $scope.selectedElts = {};
        $scope.selectedLength = 0;
        $scope.selectAll = false;
        var i;
        for (i = 0; i < $scope.users.length; ++i) {
          $scope.selectedElts[$scope.users[i]] = {
            selected: false,
            isAdmin: false
          };
        }
        for (i = 0; i < $scope.usersadmin.length; ++i) {
          $scope.selectedElts[$scope.usersadmin[i]] = {
            selected: false,
            isAdmin: true
          };
        }
      };

      $scope.removeUser = function (user) {
        removeUserFromArray(user, $scope.selectedElts[user].isAdmin ? $scope.usersadmin : $scope.users);
        $scope.selectedElt.$save();
      };

      $scope.removeSelectedUsers = function () {
        for (var key in $scope.selectedElts) {
          if ($scope.selectedElts[key].selected) {
            removeUserFromArray(key,
              $scope.selectedElts[key].isAdmin ? $scope.usersadmin : $scope.users);
          }
        }
        $scope.selectedElt.$save();
      };

      function removeUserFromArray(user, userArray) {
        var pos = userArray.indexOf(user);
        if (pos !== -1) {
          userArray.splice(pos, 1);
        }
        if ($scope.selectedElts[user].selected) {
          $scope.selectedLength--;
        }
        delete $scope.selectedLength[user];
        $scope.allUsers = _.union($scope.users, $scope.usersadmin);
        $scope.selectAll = $scope.selectedLength == $scope.allUsers.length;
      }

      function initScope() {
        // optionally initial site selection could be choosen from the $route
        $scope.sites = SiteResources.query(function () {
          if ($scope.sites.length > 0) {
            if ($stateParams.siteId === undefined) {
              $scope.selectedElt = $scope.sites[0];
            } else {
              for (var i = 0; i < $scope.sites.length; ++i) {
                if ($scope.sites[i]._id === $stateParams.siteId) {
                  $scope.selectedElt = $scope.sites[i];
                  break;
                }
              }
            }
            $scope.update();
          }
        });
      }

      initScope();

    }]);
})();
