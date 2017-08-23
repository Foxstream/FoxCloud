/**
 * @class CurrentUser
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages user settings
 */

require('../../services/user-service');

angular.module('FSCounterAggregatorApp')
    .controller('CurrentUser', [
	'$scope',
	'UserService',
	function(
	    $scope,
	    UserService
	) {
	    $scope.params = UserService;
	    $scope.username = "";
	    $scope.email = "";
	    
	    UserService.getSettings()
		.then(function(data) {
		    $scope.username = data.user.name;
		    $scope.email = data.user.email;
		});

	    $scope.oldPassword = "";
	    $scope.newPassword = "";
	    $scope.newPassword2 = "";
	    
	    $scope.$watch('params.currentUserData', function(newVal, oldVal) {
		if(newVal != oldVal) {
		    $scope.username = newVal.user.name;
		    $scope.email = newVal.user.email;
		}
	    });
	    
	    function validPasswords()   
	    {
		//if ($scope.oldPassword == "") { $scope.message = 'Old password is empty'; return false; }
		if ($scope.newPassword === "") { $scope.message = 'New password is empty'; return false; }
		if ($scope.newPassword != $scope.newPassword2) { $scope.message = 'Passwords do not match'; return false; }
		if ($scope.oldPassword == $scope.newPassword) {
		    $scope.message = 'Old and new passwords are identical'; return false;
		}
		
		return true;            
	    }
	    
	    $scope.updatePassword = function() {
		$scope.message = null;
		
		if (!validPasswords())
		    return;
		
		UserService.setPassword({ "password": $scope.newPassword, 
					  "oldpassword": $scope.oldPassword })
		    .then(function() { 
			$scope.oldPassword = $scope.newPassword = $scope.newPassword2 = ""; 
		    }, 
			  function(err) { 
			      $scope.message = 'Unable to update your password'; 
			  });		    
	    };
	    
	    $scope.updateDisplayData = function () {
		$scope.message = null;
		
		UserService.setSettings({ "username": $scope.username })
		    .then(function () { UserService.getSettings(); }, 
			  function (err) { $scope.message = 'Unable to update your display settings'; }
			 );
	    };		
	}])
    .directive('validPassword', function() {
	return {
	    require: '?ngModel',
	    link: function (scope, elm, attrs, ngModel) {

		function isStrongPassword(pwd) {
		    return pwd.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]{6,})$/);
		}
		
		if(!ngModel) return;
		ngModel.$parsers.unshift(function (viewValue) {
		    var isBlank = viewValue === '';
		    var invalidLen = !isBlank && (viewValue.length < 6 || viewValue.length > 20);
		    var isWeak = !isBlank && !invalidLen && !isStrongPassword(viewValue);
		    ngModel.$setValidity('isBlank', !isBlank);
		    ngModel.$setValidity('isWeak', !isWeak);
		    ngModel.$setValidity('invalidLen', !invalidLen);
		    return viewValue;
		});
	    }
	};
    })
    .directive('validPasswordC', function() {
	return {
	    require: '?ngModel',
	    scope: {
		passwordC:'=',
		encryptC:'=?'
	    },
	    link: function (scope, elm, attrs, ngModel) {
		if(!ngModel) return;
		ngModel.$parsers.unshift(function (viewValue, $scope) {
		    var isBlank = viewValue === '';
		    var noMatch = viewValue != scope.passwordC;
		    ngModel.$setValidity('isBlank', !isBlank);
		    ngModel.$setValidity('noMatch', !noMatch);
		    return viewValue;
		});
	    }
	};
    });
