/**
 * @class Occupancy
 * @memberOf FSCounterAggregatorApp
 * @description Compute occupancy from a set of in/out values
 */
(function() {

    require('../../services/ComputeService');
    
    angular.module('FSCounterAggregatorApp').
	service('OccupancyIndicator', [
	    "ComputeService",
	    function(
		ComputeService
	    ) {

		var prevDate = "";

		function ResetOccupancyAtMidnight(timestamp) {
		    var currDate = moment.unix(timestamp).format("YYYY MM DD");
		    var sameDate = (currDate === prevDate);
		    prevDate = currDate;
		    return !sameDate;
		}

		// daily reset the occupancy at HHmm
		function ResetOccupancyAt(timeReset, timeStart) {

		    var nextReset = (timeStart !== undefined ?
				     moment.unix(timeStart.time).format("YYYYMMDD") : "00000000") + timeReset;

		    return function(timezone, timestamp) {
			var currTime = timezone !== undefined ? moment.unix(timestamp).tz(timezone) : moment.unix(timestamp);
			var shouldReset = (currTime.format("YYYYMMDDHHmm") >= nextReset);
			if(shouldReset) {
			    nextReset = currTime.add(1, 'days').format("YYYYMMDD") + timeReset;
			}
			return shouldReset;
		    };
		}
		
		this.compute = function(data) {

		    for(var i = 0; i < data.length; ++i) {
			var timeReset = (data[i].siteInfo !== undefined &&
					 data[i].siteInfo.occupancyTimeReset !== undefined) ?
			    data[i].siteInfo.occupancyTimeReset : "0000";
			// when existing we always use the site timezone for the occupancy reset
			// otherwise local time is used
			var timezone = data[i].siteInfo !== undefined ? data[i].siteInfo.timezone : undefined;
			var funcReset = ResetOccupancyAt(timeReset, data[i].data[0]).bind(undefined, timezone);
			ComputeService.cOccupancy(data[i].data, 'in', 'out', 'occ', funcReset);
		    }
		};
	    }]);
})();
