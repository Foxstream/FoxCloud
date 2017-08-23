/**
 * @class fcaTopBar
 * @memberOf FSCounterAggregatorApp
 * @description Manage the topbar data
 */
(function() {

    require('../../services/user-service');
    
    angular.module('FSCounterAggregatorApp')
	.directive('fcaTopBar', 
		   ['UserService',
		    function(
			UserService
		    ) {
			return {
			    link: function(scope, element, attr) {
				scope.params = UserService;
				scope.user = undefined;
				
				UserService.getSettings()
				    .then(function(ret) {
					scope.user = ret.user;
				    });

				scope.$watch('params.currentUserData', function(newVal, oldVal) {
				    if(oldVal != newVal) {
					scope.user = newVal.user;
				    }
				});

			    },
			    templateUrl: 'build/html/TopBarView.html'
			};
	}]);
    
}());
