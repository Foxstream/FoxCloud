/**
 * @class fcaUserDashboard
 * @memberOf FSCounterAggregatorApp
 * @description Manage the user defined dashboard
 */
require('../../services/user-service');

angular.module('FSCounterAggregatorApp')
    .directive(
	'fcaUserDashboard',
	['UserService', '$compile',
	 function(
	     UserService, $compile
	 ) {
	     
	     return {
		 scope: {
		     params: '='
		 },
		 link: function(scope, element, attr) {

		     function updateDashboard(user) {

			 element.html(user.userInfo.dashboard).show();
			 $compile(element.contents())(scope);
			 
		     }
		     
		     UserService.getSettings()
			 .then(function(ret) {

			     updateDashboard(ret.user);
			     
			 });

		     scope.$watch('params.currentUserdata', function(newVal, oldVal) {
			 if(oldVal != newVal) {
			     updateDashboard(newVal.user);
			 }
		     });
		 }
	     };
	      
	  }]
    );
