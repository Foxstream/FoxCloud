/**
 * @class KPIMean
 * @memberOf FSCounterAggregatorApp
 * @description Compute the mean value for on a set of data indicators
 */
(function() {

    require('../../services/ComputeService');
    
    angular.module('FSCounterAggregatorApp').
	controller('KPIMean', [
	    "ComputeService",
	    function(
		ComputeService
	    ) {

		this.getDefaultIndicatorId = function() {
		    return "in";
		};

		this.getLabel = function(id) {
		    return "mean ".concat(id);
		};

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
    			    res.value += ComputeService.cMean(query.allsitedata[i].data,
    							  getSelectedIndicator);
		        }
            else
                res.value += ComputeService.cMean(query.sitedata, getSelectedIndicator);

			res.value = Math.round(res.value / (query.period.endDate - query.period.startDate));

		    return res;
		};

	    }]);
}());
