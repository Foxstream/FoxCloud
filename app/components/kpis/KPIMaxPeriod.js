/**
 * @class KPIMaxPeriod
 * @memberOf FSCounterAggregatorApp
 * @description Retrieve the period which have the max indicator value
 */
(function() {

    require('../../services/ComputeService');
    
    angular.module('FSCounterAggregatorApp').
	controller('KPIMaxPeriod', [
	    "ComputeService",
	    function(
		ComputeService
	    ) {

		this.getDefaultIndicatorId = function() {
		    return "in";
		};

		this.getLabel = function(id) {
		    return "max period";
		};

        function groupSiteByHour(data, indicator)
        {
            var arrayOfDataPerHour = _.groupBy(data, function(item){
                return moment( (+item.time + 1800 )*1000).hour();//the closest hour (16:45 -> 17:00)
            });

            var siteByHour = _.mapValues(arrayOfDataPerHour, function(it){
                return _.sumBy(it, indicator);
            });

            return siteByHour;
        }

        function groupAllSitesByHour(data, indicator)
        {
            var sitesSumByHour = _.map(data, function(siteData){
                return groupSiteByHour(siteData.data, indicator);
            });

            return _.reduce(sitesSumByHour, function(acc, siteSumByHour){
                _.forEach(siteSumByHour, function(value, hour){
                    acc[hour+""] = value + (acc[hour+""] | 0);
                });
                return acc;
            }, {});
        }


		/**
		 * @function compute
		 * @memberOf FSCounterAggregatorApp.KPIMaxPeriod
		 * @description Returns the period which have the max value
		 */
		this.compute = function(query) {
            if(!query.indicator)
                query.indicator = this.getDefaultIndicatorId();

		    var res = {
			         query: query,
			         value: 0
		    };

            var hours = [];

            if(query.allsitedata)
                hours = groupAllSitesByHour(query.allsitedata, query.indicator);
            else if(query.sitedata )
                hours = groupSiteByHour(query.sitedata, query.indicator);

            var mx = _.max(_.values(hours));
            var maxHour = _.findKey(hours, function(v){ return v == mx;});


            res.value= maxHour ? maxHour : "no data";

		    return res;
		};

	    }]);
}());
