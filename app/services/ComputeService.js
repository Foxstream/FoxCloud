/**
 * @class ComputeService
 * @memberOf FSCounterAggregatorApp
 * @description A set of numerical methods
 */
(function() {

 angular.module('FSCounterAggregatorApp').service('ComputeService', function() {

     var that = this;

     this.NSEC_5MIN = 300;
     this.NSEC_15MIN = 900;
     this.NSEC_HOUR = 3600;
     this.NSEC_DAY = 86400;
     this.NSEC_WEEK = 604800;

     this.rangeFunc = {
	 '5min': {
	     init: function(date) {
		 return date.minute(Math.floor(date.minute() / 5) * 5);
	     },
	     step: function(date) {
		 return date.add(5,"m");
	     },
	     dist: function(date, dateStart) {
		 return that.getTimeIndex(date.unix(),
					  dateStart.unix(),
					  that.NSEC_5MIN);
	     }},
	 '15min': {
	     init: function(date) {
		 return date.minute(Math.floor(date.minute() / 15) * 15);
	     },
	     step: function(date) {
		 return date.add(15,"m");
	     },
	     dist: function(date, dateStart) {
		 return that.getTimeIndex(date.unix(),
					  dateStart.unix(),
					  that.NSEC_15MIN);
	     }},
	 'hours': {
	     init: function(date) {
		 return date.minute(0);
	     },
	     step: function(date) { return date.add(1, "h"); },
	     dist: function(date, dateStart) {
		 return that.getTimeIndex(date.unix(),
					  dateStart.unix(),
					  that.NSEC_HOUR);
	     }},
	 'days': {
	     init: function(date) {
		 return date.minute(0).hour(0);
	     },
	     step: function(date) { return date.add(1, "d"); },
	     dist: function(date, dateStart) {
		 return that.getTimeIndex(date.unix(),
					  dateStart.unix(),
					  that.NSEC_DAY);
	     }},
	 'week': {
	     init: function(date) {
		 return date.day(1);
	     },
	     step: function(date) { return date.add(1, "w"); },
	     dist: function(date, dateStart) {
		 return that.getTimeIndex(date.unix(),
					  dateStart.unix(),
					  that.NSEC_WEEK);
	     }},
	 'month': {
	     init: function(date) {
		 return date.date(1);
	     },
	     step: function(date) { return date.add(1,"M"); },
	     dist: function(date, dateStart) {
		 //return date.diff(dateStart, "months");
		 return (date.year()*12 + date.month()) -
		     (dateStart.year()*12 + dateStart.month());
	     }}
     };

     /**
      * @function getTimeIndex
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description returns the number of step interval between 2 values
      */
     this.getTimeIndex = function(time, timeStart, step) {
	 return Math.floor((time - timeStart) / step);
     };

     /**
      * @function getTimeIterator
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description returns the function with iterate over a specific time range
      */
     this.getTimeIterator = function(step) {
	 return this.rangeFunc[step].step;
     };

     /**
      * @function createTimeIndex
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description returns an array of index elements for a period range
      */
     this.createTimeIndex = function(period, initFunc, stepFunc, idxFuncValue) {
	 var index = [];
	 var ts = initFunc(period.startDate.clone());
	 for(var i = 0; ts.unix() < period.endDate.unix(); ++i) {
	     index.push({ x: ts.clone(), y: idxFuncValue(i, ts) });
	     ts = stepFunc(ts);
	 }
	 return index;
     };

     this.createFixedLengthIndex = function(length, idxFuncValue) {
	 var index = [];
	 for(var i = 0; i < length; ++i) {
	     index.push({x: i, y: idxFuncValue(i) });
	 }
	 return index;
     };

     /**
      * @function fillIndex
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description create new index
      */
     this.fillIndex = function(data, index, idxFunc) {
	 for(var i = 0; i < data.length; ++i) {
	     var idx = idxFunc(data[i]);
	     if(idx !== undefined &&
		idx >= 0 &&
		idx < index.length) {
		 if(index[idx].y === undefined) {
		     index[idx].y = [ i ];
		 } else {
		     index[idx].y.push(i);
		 }
	     }
	 }
	 return index;
     };

     /**
      * @function aggregate
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description generic function to merge data regarding indexes list
      */
     this.aggregate = function(data, index, cumulFunc, endCumulFunc) {
	 var res = [];
	 for(var i = 0; i < index.length; ++i) {
	     var curIndex = index[i];
	     var cumul = { x: curIndex.x, y: cumulFunc() };
	     if(curIndex.y !== undefined) {
		 for(var j = 0; j < curIndex.y.length; ++j) {
		     cumul.y = cumulFunc(data[curIndex.y[j]], cumul.y,
					 j, curIndex.y.length);
		 }
	     }
	     res.push(cumul);
	 }
	 return res;
     };

     /**
      * @function split
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description transpose a javascript array into a javascript object
      */
     this.split = function(data) {
	 var res = {};
	 for(var i = 0; i < data.length; ++i) {
	     for(var key in data[i]) {
		 if(res.key === undefined) {
		     res.key = [ data[i].key ];
		 } else {
		     res.push(data[i].key);
		 }
	     }
	 }
	 return res;
     };

     /**
      * @function IdentityFunc
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description f(x) = x
      */
     this.identityFunc = function(x) {
	 return x;
     };


     /**
      * @function cSum
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description Simply returns the sum of all elements in a array
      */
     this.cSum = function(data, fsum) {
	 var s = 0;
	 for(var i = 0; i < data.length; ++i) {
	     s += fsum(data[i]);
	 }
	 return s;
     };

     /**
      * @function cMean
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description Returns the mean of all elements in a array
      */
     this.cMean = function(data, fsum) {
	 return data.length === 0 ? 0 : this.cSum(data, fsum) / data.length;
     };

     /**
      * @function cMax
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description Returns the array element which have the max value
      */
     this.cMax = function(data, fvalue) {
	 var maxElt;
	 if(data.length > 0) {
	     var maxIdx = 0;
	     for(var i = 1; i < data.length; ++i) {
		 if(fvalue(data[i]) > fvalue(data[maxIdx])) {
		     maxIdx = i;
		 }
	     }
	     maxElt = fvalue(data[maxIdx]);
	 }
	 return maxElt;
     };

     /**
      * @function cSumForPeriod
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description aggregate data on a period grouped by step duration
      */
     this.cFuncForPeriod = function(data, period, step, id, func) {

	 var that = this;

	 var timeIndex = this.createTimeIndex(period,
					      that.rangeFunc[step].init,
					      that.rangeFunc[step].step,
					      function() { return undefined; });
	 timeIndex = this.fillIndex(data,
				    timeIndex,
				    function(elt) {
					return that.rangeFunc[step].dist(
					    moment(elt.time*1000), period.startDate);
				    }
				   );
	 var tdata = this.aggregate(data,
				    timeIndex,
				    func);
	 return tdata;
     };

     /**
      * @function cSumForPeriod
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description aggregate data on a period grouped by step duration
      */
     this.cSumForPeriod = function(data, period, step, id) {

	 return this.cFuncForPeriod(data, period, step, id,
				    function(elt, curCumul) {
					return curCumul !== undefined ?
					    curCumul + elt[id] : 0;
				    });
     };

     /**
      * @function cMeanForPeriod
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description aggregate data on a period grouped by step duration
      */
     this.cMeanForPeriod = function(data, period, step, id) {

	 return this.cFuncForPeriod(data, period, step, id,
				    function(elt, curCumul, pos, length) {
					if(curCumul !== undefined) {
					    return pos == (length - 1) ?
						Math.round((curCumul + elt[id])/length) :
						curCumul + elt[id];
					} else {
					    return 0;
					}
				    });
     };

     /**
      * @function cMaxForPeriod
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description aggregate data on a period grouped by step duration
      */
     this.cMaxForPeriod = function(data, period, step, id) {

	 return this.cFuncForPeriod(data, period, step, id,
				    function(elt, curCumul, pos, length) {
					if(curCumul !== undefined) {
					    return elt[id] > curCumul ? elt[id]: curCumul;
					} else {
					    return 0;
					}
				    });
     };


     /**
      * @function cOccupancy
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description Compute occupancy values based on in/out
      */
     this.cOccupancy = function(data, idIn, idOut, idOcc, shouldResetValueFnct) {
	 var occupancy = 0;
	 for(var i = 0; i < data.length; ++i) {
	     occupancy = Math.max(0, occupancy + (data[i][idIn] - data[i][idOut]));

         if(shouldResetValueFnct && shouldResetValueFnct(data[i].time))
            occupancy = 0;

	     data[i][idOcc] = occupancy;
	 }
     };

     /**
      * @function cApplyLocalTimezone
      * @memberOf FSCounterAggregatorApp.ComputeService
      * @description Apply an time offset to sync data to a local timezone
      * To get this working we need to apply the offset in seconds between the original timezone 
      * and the local timezone.
      */
     this.cApplyLocalTimezone = function(data, tzSrc) {
	 var offsetInSeconds = (moment.tz(tzSrc).utcOffset() - moment().utcOffset())*60;
	 if(offsetInSeconds !== 0) {
	     for(var i = 0; i < data.length; ++i) {
		 var intTime = parseInt(data[i].time);		 
		 data[i].time = (intTime + offsetInSeconds).toString();
	     }
	 }
     };
     
 });

}());
