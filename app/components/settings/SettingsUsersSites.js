/**
 * @class SettingsUsersSites
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages users and sites
 * require administrator rights
 */
(function() {

    require('../../services/user-service');
    require('../../services/site-service');
    
    angular.module('FSCounterAggregatorApp')
	.controller('SettingsUsersSites', [
	    '$scope',
	    '$compile',
	    '$q',
	    'SiteService',
	    'UserService',
	    'DTOptionsBuilder',
	    'DTColumnDefBuilder',
	    function(
		$scope,
		$compile,
		$q,
		SiteService,
		UserService,
		DTOptionsBuilder,
		DTColumnDefBuilder
	    ) {

		var SiteResources = SiteService.getResource();
		var UserResources = UserService.getResource();

		$scope.selectAll = false;
		$scope.selectedLength = 0; // select all checkbox optimization
		$scope.selectedElts = {};
		
		$scope.dtOptions = DTOptionsBuilder.newOptions()
		    .withOption('headerCallback', function(header) {
			$compile(angular.element(header).contents())($scope);
		    })
		    .withOption('createdRow', function(row, data, dataIndex) {
			$compile(angular.element(row).contents())($scope);
		    });
		
		$scope.dtColumnDefs = [
		    DTColumnDefBuilder.newColumnDef(0).notSortable(),
		    DTColumnDefBuilder.newColumnDef(1),
		    DTColumnDefBuilder.newColumnDef(2)
		];

		$scope.toggleAll = function() {
		    for(var key in $scope.selectedElts) {
			$scope.selectedElts[key].selected = $scope.selectAll;
		    }
		    $scope.selectedLength = $scope.selectAll ? $scope.users.length : 0;
		};

		$scope.toggleOne = function(id) {
		    if($scope.selectedElts[id].selected) {
			$scope.selectedLength++;
			$scope.selectAll = $scope.selectedLength == $scope.users.length;
		    } else {
			$scope.selectedLength--;
			$scope.selectAll = false;
		    }
		};

		function fillUserSites(userArray, usersSites, site) {
		    for(var i = 0; i < userArray.length; ++i) {
			//usersSites[userArray[i]].push(site);
			var a = usersSites[userArray[i]];
			if(a !== undefined) {
			    a.push(site);
			} else {
			    console.log("Warning, member email " + userArray[i] + " for the site " + site._id + " does not belong to any existing users");
			}
		    }
		}
		
		function initScope() {
		    $q.all([ SiteResources.query().$promise,
			     UserResources.query().$promise ])
			.then(function(res) {

			    $scope.sites = res[0];
			    $scope.users = res[1];

			    $scope.selectedElts = {};
			    $scope.usersSites = {};

			    var i;
			    for(i = 0; i < $scope.users.length; ++i) {
				var user = $scope.users[i];
				$scope.selectedElts[user._id] = { selected: false };
				$scope.usersSites[user.email] = [];
			    }
			    for(i = 0; i < $scope.sites.length; ++i) {
				var site = $scope.sites[i];
				fillUserSites(site.users, $scope.usersSites, site);
				fillUserSites(site.usersadmin, $scope.usersSites, site);
			    }
			});
		}

		initScope();    


	    }]);
})();
