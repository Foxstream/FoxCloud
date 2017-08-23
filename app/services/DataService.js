/**
* @class DataService
* @memberOf FSCounterAggregatorApp
* @description Get Data from server
*/
(function () {

  angular.module('FSCounterAggregatorApp').service('DataService', [
    "$http",
    "$q",
    "UserService",
    "myconfig",
    function (
      $http,
      $q,
      UserService,
      myconfig
    ) {

      this.getCountDataForSiteInInterval = function (site, period) {
        if (myconfig.debug) {
          return $q.when({}).
            then(function () {
              // add rnd
              //
              var getData = Math.random();
              if (getData > 1) { // to enabled random use value inside [0;1[
                return {
                  id: site.id,
                  data: []
                };
              }

              var retData = [];
              for (var ts = period.startDate.clone(); ts.unix() < period.endDate.unix(); ts.add(15, "m")) {
                retData.push({
                  "in": Math.floor(50 * Math.random()),
                  "out": Math.floor(50 * Math.random()),
                  "time": ts.unix(),
                  "duration": 900
                });
              }
              return {
                id: site.id,
                data: retData
              };
            });
        } else {
          return $http.get("/items/" + site.id + "/countdata", {
            params: {
              start: period.startDate.unix(),
              end: period.endDate.unix()
            }
          }).
            then(function (ret) {
              return {
                id: site.id,
                data: ret.data
              };
            });
        }
      };

      /**
        * @function getHeatMapDataForItemInInterval
        * @description retrieve heatmap data for an item within
        * a period of time
      */
      this.getHeatMapDataForItemInInterval = function (itemId, period) {
        if (myconfig.debug) {
          return $http.get("assets/heatmap_01.json")
            .then(function (ret) {

              var retData = [];
              for (var ts = period.startDate.clone(); ts.unix() < period.endDate.unix(); ts.add(1, "days")) {
                retData.push({                 
                  "time": ts.unix(),
                  "duration": 86400,
                  data: ret.data.map((elt) => {
                  return elt.map(e => e + 0.2 * e * Math.random());
                })
                })
              }

              return {
                id: itemId,
                data: retData
              }
            });
        } else {
          return $http.get("/item/" + itemId + "/heatmap", {
            params: {
              start: period.startDate.unix(),
              end: period.endDate.unix()
            }
          })
            .then(function (ret) {
              return {
                id: itemId,
                data: ret.data
              };
            });
        }
      };

      /**
        * @function getHeatMapDataForSiteInInterval
        * @description retrieve all items heatmap data for a specific site within
        * a period of time
      */
      this.getHeatmapDataForSiteInInterval = function (site, period) {
        let promises = [];
        site.items.forEach((item) => {
          promises.push(this.getHeatMapDataForItemInInterval(item._id, period));
        });
        return $q.all(promises).then((dataElts) => {
          return {
            id: site.id,
            data: dataElts
          }
        });
      };

      /**
      * @function getRawDataForSiteInInterval
      * @memberOf FSCounterAggregatorApp.DataService
      * @description retrieve data for an unique site
      * within a period of time
      */
      this.getRawDataForSiteInInterval = function (site, period) {
        if (UserService.isSiteHaveHeatmap(site)) {
          return $q.all([
            this.getCountDataForSiteInInterval(site, period),
            this.getHeatmapDataForSiteInInterval(site, period)
          ]).then((dataElts) => {
            return {
              id: site.id,
              data: dataElts[0].data,
              heatmap: dataElts[1].data
            };
          });
        } else {
          return this.getCountDataForSiteInInterval(site, period);
        }
      };

      /**
      * @function getRawDataForSitesInInterval
      * @memberOf FSCounterAggregatorApp.DataService
      * @description retrieve data for a set of sites
      * within a period of time
      */
      this.getRawDataForSitesInInterval = function (sites, period) {
        let promises = [];
        sites.forEach((site) => {
          promises.push(this.getRawDataForSiteInInterval(site, period));
        });
        return $q.all(promises);
      };

      /**
      * @function getRawDataForSitesInIntervals
      * @memberOf FSCounterAggregatorApp.DataService
      * @description retrieve data for a set of sites
      * each with a specific period of time
      */
      this.getRawDataForSitesInIntervals = function (sites, periods) {
        let promises = [];
        for (let i = 0; i < sites.length; ++i) {
          promises.push(this.getRawDataForSiteInInterval(sites[i], periods[i]));
        }
        return $q.all(promises);
      };

      /**
       * @function getFakeHeatMapData
       * simply returns a promise on the heatmap data stored locally
       */
      this.getFakeHeatMapData = function (siteInfoHeatMap) {
        return $http.get(siteInfoHeatMap.data)
          .then(function (ret) {
            return ret.data;
          });
      };

    }
  ]);

}());
