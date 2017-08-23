/**
 * @class KPIMaxSiteRatio
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve the site which have the biggest amount of data
 */
(function() {

    require('../../services/ComputeService');
    
    angular.module('FSCounterAggregatorApp').
	controller('KPIMaxSiteRatio', [
	    "ComputeService",
	    function(
		ComputeService
	    ) {

		this.getDefaultIndicatorId = function() {
		    return "in";
		};

		this.getLabel = function(id) {
		    return "";
		};

		/**
		 * @function compute
		 * @memberOf FSCounterAggregatorApp.KPIMaxSiteRatio
		 * @description Returns the site which have the biggest
		 * amount of data
		 */
		this.compute = function(query) {

            if(!query.indicator)
                query.indicator = this.getDefaultIndicatorId();

            var res = {
                query: query,
                value: 0
            };

            var siteSums = _.map(query.allsitedata, function(siteData){return _.sumBy(siteData.data, query.indicator);});

            var maxIdx = _.indexOf(siteSums, _.max(siteSums));

            res.value = maxIdx>=0 ? query.allsitedata[maxIdx].id:"n/a";
            return res;
		};

	    }]);
}());
