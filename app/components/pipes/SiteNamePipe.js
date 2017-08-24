/*
 * Transform a site id to its name (or "" if the site is not available)
 **/
(function () {
  angular.module('FSCounterAggregatorApp').filter("SiteName", [
    "LegacyUserService",
    function (LegacyUserService) {
      var addSiteName = function (siteId) {
        var mySite = _.find(LegacyUserService.getCachedSettings().sites, function (site) {
          return site._id == siteId;
        });

        return mySite ? mySite.name : "";
      };

      return addSiteName;
    }]);
}());
