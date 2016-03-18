/**
 * @class DataService
 * @memberOf FSCounterAggregatorApp
 * @description Get Data from server
 */
(function() {

 angular.module('FSCounterAggregatorApp').service('DataService', [
     "$http", 
     "$q",
     "useServerAPI",
     function(
	 $http,
	 $q,
	 useServerAPI
     ) {
	 
	 /**
	  * @function getRawDataForSiteInInterval
	  * @memberOf FSCounterAggregatorApp.DataService
	  * @description retrieve counting data for an unique site 
	  * within a period of time
	  */
	 this.getRawDataForSiteInInterval = function(siteId, period) {	 
	     return useServerAPI ? 
		 $http.get("/items/" + siteId + "/countdata",
			   { params: { 
			       start: period.startDate.unix(), 
			       end:  period.endDate.unix()
			   }}).
		 then(function(ret) {
		     return { id: siteId,
			      data: ret.data };
		 }) : 
	     $q.when({}).
		 then(function() {
		     // add rnd
		     var retData = [];
		     for(var ts = period.startDate.clone(); 
			 ts.unix() < period.endDate.unix(); ts.add(15,"m")) {
			 retData.push({ "in": Math.floor(50 * Math.random()),
					"out": Math.floor(50 * Math.random()),
					"time": ts.unix(),
					"duration": 900 });
		     }		     
		     return { id: siteId,
			      data: retData };
		 });
	 };	 

	 /**
	  * @function getRawDataForSitesInInterval
	  * @memberOf FSCounterAggregatorApp.DataService
	  * @description retrieve counting data for a set of sites
	  * within a period of time
	  */
	 this.getRawDataForSitesInInterval = function(sitesId, period) {	     
	     var promises = [];
	     for(var i = 0; i < sitesId.length; ++i) {
		 promises.push(this.getRawDataForSiteInInterval(sitesId[i], period));
	     }
	     return $q.all(promises);
	 };
 }]);

}());
