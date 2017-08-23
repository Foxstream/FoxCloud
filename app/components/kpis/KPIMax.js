/**
 * @class KPIMax
 * @memberOf FSCounterAggregatorApp
 * @description Compute the max value for on a set of data indicators
 */
(function() {

    require('../../services/ComputeService');
    
    angular.module('FSCounterAggregatorApp').
	controller('KPIMax', [
	    "ComputeService",
	    function(
		ComputeService
	    ) {

		this.getDefaultIndicatorId = function() {
		    return "in";
		};

		this.getLabel = function(id) {
		    return "max ".concat(id);
		};

		function computeMaxSite(siteData, indicator)
		{
		    return _.maxBy(siteData, indicator);
		}

		/**
		 * @function compute
		 * @memberOf FSCounterAggregatorApp.KPIMean
		 * @description Returns the mean value of
		 * data within a period of time
		 */
		this.compute = function(query) {

		    var res = {
			query: query,
			value: 0
		    };

		    if(!query.indicator)
			query.indicator = this.getDefaultIndicatorId();

		    function getSelectedIndicator(elt) {
			return elt[query.indicator];
		    }

		    if(query.allsitedata)
			for(var i = 0; i < query.allsitedata.length; ++i) {
			    var siteMax = computeMaxSite(query.allsitedata[i].data, query.indicator);
			    if(siteMax && siteMax[query.indicator]>res.value)
				res.value = siteMax[query.indicator];
			}
		    else {
			var maxElt = computeMaxSite(query.sitedata.data, query.indicator);
			res.value = maxElt ? maxElt[query.indicator] : "?";
		    }

		    return res;
		};

	    }]);
}());
