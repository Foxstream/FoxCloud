/*
 * Transform a site id to its name (or "" if no site available)
 **/

(function() {

    require('../../services/user-service');
    
 angular.module('FSCounterAggregatorApp')
    .filter("SiteName", ["UserService", function(UserService)
    {
        var addSiteName = function(siteId)
        {
            var mySite = _.find(UserService.getCachedSettings().sites, function(site){
                return site._id == siteId;
            });

            return mySite ? mySite.name : "";
        };

        return addSiteName;
    }]);
}());
