/**
 * @class SettingsSiteMembers
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages relation between users and sites
 */
(function () {
  angular.module('FSCounterAggregatorApp').controller('SettingsSiteMembers', [
    '$scope',
    '$stateParams',
    '$q',
    'LegacyUserService',
    'SiteService',
    'DTOptionsBuilder',
    'DTColumnDefBuilder',
    function (
      $scope,
      $stateParams,
      $q,
      LegacyUserService,
      SiteService,
      DTOptionsBuilder,
      DTColumnDefBuilder
    ) {

      // members (users) connected to the selected site
      $scope.members = [];

      $scope.selectAll = false;
      $scope.selectedLength = 0;
      $scope.selectedElts = {};
      $scope.selectedElt = undefined;
      // used to share data between listmode & editionmode
      $scope.member = undefined;
      $scope.isEditionMode = false;

      $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption("order", [[1, "asc"]])
        .withBootstrap();

      $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notSortable(),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3).notSortable()
      ];

      $scope.toggleAll = function () {
        $scope.selectAll = !$scope.selectAll;
        for (var key in $scope.selectedElts) {
          $scope.selectedElts[key].selected = $scope.selectAll;
        }
        $scope.selectedLength = $scope.selectAll ? $scope.members.length : 0;
      };

      $scope.toggleOne = function (id) {
        if ($scope.selectedElts[id].selected) {
          $scope.selectedLength++;
          $scope.selectAll = $scope.selectedLength == $scope.members.length;
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

      $scope.update = function () {

        function fillSelected(members, prefillMembers, isAdmin) {
          for (var i = 0; i < members.length; ++i) {
            var member = {
              site: $scope.selectedElt,
              email: members[i],
              isAdmin: isAdmin
            };
            prefillMembers.push(member);
            $scope.selectedElts[member.email] = {
              'selected': false,
              'member': member
            };
          }
        }

        SiteService.getSite($scope.selectedElt._id)
          .then(function (site) {

            var prefillMembers = [];
            $scope.selectedElts = {};
            $scope.selectedLength = 0;
            $scope.selectAll = false;

            fillSelected(site.users, prefillMembers, false);
            fillSelected(site.usersadmin, prefillMembers, true);

            $scope.members = prefillMembers;
          });
      };

      $scope.selectElt = function (elt) {
        $scope.selectedElt = elt;
        $scope.update();
      };

      $scope.addMember = function () {
        $scope.switchToEditionMode();
        $scope.isNewMember = true;
        $scope.member = {
          site: $scope.selectedElt,
          email: "",
          isAdmin: false
        };
      };

      $scope.editMember = function (member) {
        $scope.switchToEditionMode();
        $scope.isNewMember = false;
        $scope.member = member;
      };

      $scope.saveMember = function () {

        function add_member(siteId, member) {
          return SiteService.addUser(siteId,
            member.email,
            member.isAdmin)
            .then(function (ret) {
              $scope.members.push(member);
              $scope.selectedElts[member.email] = {
                'selected': false,
                'member': member
              };
              $scope.selectAll = $scope.selectedLength == $scope.members.length;
              return ret;
            });
        }

        if ($scope.isNewMember) {
          add_member($scope.selectedElt._id, $scope.member);
          $scope.member = undefined; // clear to force the editor to update
        } else {
          // edit means that the member isAdmin changed so
          // we have to remove and add again
          var newAdminValue = $scope.member.isAdmin;
          // 1st we remove him from its old container
          $scope.member.isAdmin = !newAdminValue;
          $scope.removeMember($scope.member)
            .then(function () {
              $scope.member.isAdmin = newAdminValue;
              add_member($scope.selectedElt._id, $scope.member)
                .then(function () {
                  $scope.member = undefined; // clear to force the editor to update
                });
            });
        }
      };

      $scope.removeMember = function (member) {
        return SiteService.removeUser($scope.selectedElt._id, member.email, member.isAdmin)
          .then(function (ret) {
            removeMemberFromArray(member);
            return member;
          });
      };

      $scope.removeSelectedMembers = function () {
        var promises = [];
        for (var key in $scope.selectedElts) {
          if ($scope.selectedElts[key].selected) {
            promises.push(SiteService.removeUser($scope.selectedElt._id,
              $scope.selectedElts[key].member.email,
              $scope.selectedElts[key].member.isAdmin));
          }
        }
        $q.all(promises)
          .then(function (ret) {
            $scope.update();
          });
      };

      function removeMemberFromArray(member) {
        var pos = $scope.members.indexOf(member);
        $scope.members.splice(pos, 1);
        if ($scope.selectedElts[member.email].selected) {
          $scope.selectedLength--;
        }
        delete $scope.selectedElts[member.email];
        $scope.selectAll = $scope.selectedLength == $scope.members.length;
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
