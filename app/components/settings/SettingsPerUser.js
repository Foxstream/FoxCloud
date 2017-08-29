/**
 * @class SettingsPerUser
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages single user
 * require administrator rights
 */
(function () {
  angular.module('FSCounterAggregatorApp').controller('SettingsPerUser', [
    '$scope',
    '$compile',
    '$stateParams',
    '$q',
    'LegacyUserService',
    'LegacySiteService',
    'DTOptionsBuilder',
    'DTColumnDefBuilder',
    function (
      $scope,
      $compile,
      $stateParams,
      $q,
      LegacyUserService,
      LegacySiteService,
      DTOptionsBuilder,
      DTColumnDefBuilder
    ) {

      var SiteResources = LegacySiteService.getResource();
      var UserResources = LegacyUserService.getResource();

      $scope.selectAll = false;
      $scope.selectedLength = 0; // select all checkbox optimization
      $scope.selectedElts = {};
      $scope.selectedElt = undefined;
      $scope.user = undefined;

      $scope.dtOptions = DTOptionsBuilder.newOptions();

      $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2)
      ];

      $scope.toggleAll = function () {
        for (var key in $scope.selectedElts) {
          $scope.selectedElts[key].selected = $scope.selectAll;
        }
        $scope.selectedLength = $scope.selectAll ? $scope.userSites : 0;
      };

      $scope.toggleOne = function (id) {
        if ($scope.selectedElts[id].selected) {
          $scope.selectedLength++;
          $scope.selectAll = $scope.selectedLength == $scope.userSites;
        } else {
          $scope.selectedLength--;
          $scope.selectAll = false;
        }
      };

      $scope.selectElt = function (elt) {
        $scope.selectedElt = elt;
        $scope.selectedLength = 0;
        $scope.selectAll = false;
        $scope.update();
      };

      $scope.editUser = function (user) {
      };

      $scope.deleteUser = function (user) {
      };

      function haveUser(userArray, user, key) {
        for (var i = 0; i < userArray.length; ++i) {
          if (userArray[i] == user[key]) {
            return true;
          }
        }
        return false;
      }

      $scope.update = function () {
        $scope.userSites = {};
        $scope.selectedElts = {};
        for (var i = 0; i < $scope.sites.length; ++i) {
          var site = $scope.sites[i];
          var inUsers = haveUser(site.users, $scope.selectedElt, "email");
          var inUsersAdmin = haveUser(site.usersadmin, $scope.selectedElt, "email");
          if (inUsers || inUsersAdmin) {
            $scope.userSites[site._id] = {
              "_id": site._id,
              "name": site.name,
              "role": inUsers ? 'Viewer' : 'Admin'
            };
            $scope.selectedElts[site._id] = {selected: false};
          }
        }
      };

      function initScope() {
        $q.all([SiteResources.query().$promise,
          UserResources.query().$promise])
          .then(function (res) {

            $scope.sites = res[0];
            $scope.users = res[1];

            if ($scope.users.length > 0) {
              if ($stateParams.userId === undefined) {
                $scope.selectedElt = $scope.users[0];
              } else {
                for (var i = 0; i < $scope.users.length; ++i) {
                  if ($scope.users[i]._id === $stateParams.userId) {
                    $scope.selectedElt = $scope.users[i];
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
