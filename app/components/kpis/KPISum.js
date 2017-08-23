/**
 * @class KPISum
 * @memberOf FSCounterAggregatorApp
 * @description Compute the sum for a set of data indicators
 */
(function() {

    require('../../services/ComputeService');
    
    angular.module('FSCounterAggregatorApp').
	controller('KPISum', [
	    "ComputeService",
	    function(
		ComputeService
	    ) {

		this.getDefaultIndicatorId = function() {
		    return "in";
		};

		this.getLabel = function(id) {
		    return "total ".concat(id);
		};

		/**
		 * @function compute
		 * @memberOf FSCounterAggregatorApp.KPISum
		 * @description Returns the total of
		 * data within a period of time (for a site or for multi-site)
		 */
		this.compute = function(query) {

		    var res = {
			query: query,
			value: 0
		    };

		    if(!query.indicator) {
			query.indicator = this.getDefaultIndicatorId();
		    }

		    var felt = function(elt) { return elt[query.indicator];};

		    if(query.allsitedata) {
		        for(var i = 0; i < query.allsitedata.length; ++i) {
			    res.value += ComputeService.cSum(query.allsitedata[i].data, felt);
			}
		    } else {
			res.value += ComputeService.cSum(query.sitedata.data, felt);
		    }

		    return res;
		};
		
	    }]);
}());
