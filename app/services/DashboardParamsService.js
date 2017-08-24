/**
 * @class DashboardParamsService
 * @memberOf FSCounterAggregatorApp
 * @description Manage global dashboard parameters such as periods
 **/

(function () {
  require('./DataService');
  require('./ComputeService');
  require('../components/indicators/OccupancyIndicator');

  angular.module('FSCounterAggregatorApp').service('DashboardParamsService', [
    "$http",
    "$q",
    "DataService",
    "LegacyUserService",
    "SiteService",
    "ComputeService",
    "OccupancyIndicator",
    "myconfig",
    function (
      $http,
      $q,
      DataService,
      LegacyUserService,
      SiteService,
      ComputeService,
      OccupancyIndicator,
      myconfig
    ) {

      this.period = {
        startDate: moment().hours(0).minutes(0).seconds(0).milliseconds(0),
        endDate: moment().hours(23).minutes(59).seconds(59).milliseconds(999)
      };

      // by default set it to yesterday
      this.comparedPeriod = {
        startDate: this.period.startDate.clone().subtract(1, 'days'),
        endDate: this.period.endDate.clone().subtract(1, 'days')
      };

      this.sites = [];

      this.data = [];

      // compared data must be set to empty in order
      // to desactivate period comparisons on widget side
      this.comparedData = undefined;

      this.useTimeZone = false;

      this.loadParams = function () {
        var that = this;
        return LegacyUserService.getSettings().then(function (data) {

          let sites = [];

          if (myconfig.debug) {
            that.sites = data.sites.map((site) => {
              return {
                id: site._id,
                name: site.name,
                siteInfo: site.siteInfo,
                items: site.items
              };
            });
            return that;
          } else {

            var SiteResources = SiteService.getResource();
            var promises = [];

            var funcAddSite = function (sites, site) {
              sites.push({
                id: site._id,
                name: site.name,
                siteInfo: site.siteInfo,
                items: site.items
              });
            };

            var funcError = function (reason) {
              console.log(reason);
            };

            for (let i = 0; i < data.sites.length; ++i) {
              promises.push(SiteResources.get({siteId: data.sites[i]._id}).$promise
                .then(funcAddSite.bind(undefined, sites),
                  funcError));
            }

            return $q.all(promises).then(function () {
              that.sites = sites;
              return that;
            });
          }
        });
      };

      var that = this;

      function addSiteInfo(sites, data) {
        _.forEach(_.filter(sites, 'siteInfo'), function (site) {
          var elt = _.find(data, ['id', site.id]);
          elt.siteInfo = site.siteInfo;
        });
      }

      function convertSiteTimezone(data) {
        _.forEach(_.filter(data, 'siteInfo'), function (site) {
          if (site.siteInfo.timezone !== undefined) {
            ComputeService.cApplyLocalTimezone(site.data, site.siteInfo.timezone);
          }
        });
      }

      function loadDataOnPeriod(sites, period) {
        if (!that.useTimeZone) {
          return DataService.getRawDataForSitesInInterval(
            sites,
            period).then(function (data) {
            addSiteInfo(sites, data);
            OccupancyIndicator.compute(data);
            return data;
          });
        } else {
          // run through siteinfo timezone parameters
          // adapt the period regarding the tz
          // query then set the timestep to the tz
          var periods = [];
          _.forEach(sites, function (site) {
            if (site.siteInfo !== undefined &&
              site.siteInfo.timezone !== undefined) {
              periods.push({
                "startDate": moment.tz(period.startDate.format("YYYY-MM-DD HH:mm:ss"), site.siteInfo.timezone),
                "endDate": moment.tz(period.endDate.format("YYYY-MM-DD HH:mm:ss"), site.siteInfo.timezone)
              });
            } else {
              periods.push(period);
            }
          });
          return DataService.getRawDataForSitesInIntervals(
            sites,
            periods).then(function (data) {
            addSiteInfo(sites, data);
            OccupancyIndicator.compute(data);
            convertSiteTimezone(data);
            return data;
          });
        }
      }

      this.loadData = function () {
        var that = this;
        return loadDataOnPeriod(this.sites, this.period)
          .then(function (data) {
            that.data = data;
            return that;
          });
      };

      this.loadDataCompared = function () {
        var that = this;
        return loadDataOnPeriod(this.sites, this.comparedPeriod)
          .then(function (data) {
            that.comparedData = data;
            return that.loadData();
          });
      };

      // reload all the data including comparison if activated
      this.reloadData = function () {
        this.loadData();
        if (this.comparedData !== undefined) {
          this.loadDataCompared();
        }
      };

      // must be called in order to remove comparison on widget sides
      this.disableDataCompared = function () {
        this.comparedData = undefined;
      };
    }]);
}());
