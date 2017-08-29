/**
 * @namespace FSCounterAggregatorApp
 */

(function () {
  // Main module declaration
  // require('angular');
  require('angular-ui-codemirror');
  require('./components/modules/ngReallyClickModule');
  require('./services/LayoutService');

  angular.module('FSCounterAggregatorApp', [
    'ui.router',
    'ngResource',
    'ui.bootstrap',
    'daterangepicker',
    'nvd3',
    'datatables',
    'datatables.bootstrap',
    'ui.codemirror',
    'adminLTE',
    'ngReallyClickModule',
    'angularScreenfull'
  ]);

  // Services
  require('./services/authentication-service');
  require('./services/legacy-user-service');
  require('./services/legacy-site-service');
  require('./services/user-service');

  // Controllers
  require('./components/dashboard/DashboardController');
  require('./components/monitoring/MonitoringController');
  require('./components/settings/CurrentUser');
  require('./components/settings/SettingsSiteItems');
  require('./components/settings/SettingsSiteMembers');
  require('./components/settings/SettingsPerSite');
  require('./components/settings/SettingsUsersSites');
  require('./components/settings/SettingsPerUser');

  // Directives
  require('./components/dashboard/SideMenu');
  require('./components/topbar/TopBar');
  require('./components/settings/form-controls/site-app-data');
  require('./components/settings/form-controls/user-app-data');
  require('./components/settings/MemberEditor');
  require('./components/settings/SiteEditor');
  require('./components/settings/UserSiteEditor');
  require('./components/widgets/CalendarPicker');
  require('./components/widgets/GraphKPI');
  require('./components/widgets/heatmap/HeatMapKPI');
  require('./components/widgets/StatBox');
  require('./components/widgets/StatBoxKPI');
  require('./components/widgets/TableKPI');
  require('./components/widgets/UserDashboard');

  // Components
  require('./components/settings/settings-sites');
  require('./components/settings/settings-users');
  require('./components/settings/sites/edit');
  require('./components/settings/sites/new');
  require('./components/settings/users/edit');
  require('./components/settings/users/new');

  // kpis
  require('./components/kpis/KPIMax');
  require('./components/kpis/KPIMaxPeriod');
  require('./components/kpis/KPIMaxSiteRatio');
  require('./components/kpis/KPIMean');
  require('./components/kpis/KPISum');

  angular.module('FSCounterAggregatorApp')
    .controller('KPISumGeneric', require('./components/kpis/KPISumGeneric'))
    .controller('KPISumMax', require('./components/kpis/KPISumMax'))
    .controller('KPIPeriodGeneric', require('./components/kpis/KPIPeriodGeneric'))
    .controller('KPISitesPeriod', require('./components/kpis/KPISitesPeriod'))
    .controller('KPITypicalDay', require('./components/kpis/KPITypicalDay'));

  // Filters
  require('./components/pipes/HourFormatPipe');
  require('./components/pipes/SiteNamePipe');

  // Configure routes
  angular.module('FSCounterAggregatorApp').config([
    '$urlRouterProvider',
    '$stateProvider',
    function (
      $urlRouterProvider,
      $stateProvider
    ) {

      // For any unmatched url, redirect to the main page
      $urlRouterProvider.otherwise("/dashboard");

      $stateProvider
        .state('dashboard', {
          url: '/dashboard',
          templateUrl: 'build/html/DashboardView.html',
          controller: 'DashboardController',
          pageName: 'Counters / Sites Overview',
          category: 'Counters'
        })
        .state('generic', {
          url: '/generic',
          templateUrl: 'build/html/GenericView.html',
          controller: 'DashboardController',
          pageName: 'Counters / Generic',
          category: 'Counters'
        })
        .state('mydashboard', {
          url: '/mydashboard',
          templateUrl: 'build/html/MyDashboardView.html',
          controller: 'DashboardController',
          pageName: 'Counters / MyDashboard',
          category: 'Counters'
        })
        .state('monitoring', {
          url: '/monitoring',
          templateUrl: 'build/html/MonitoringView.html',
          controller: 'MonitoringController',
          pageName: 'Monitoring / Sites Overview',
          category: 'Monitoring'
        })
        .state('current_user', {
          url: '/current_user',
          templateUrl: 'build/html/CurrentUserView.html',
          pageName: "My account",
          controller: 'CurrentUser',
          category: "Settings"
        })
        .state('settings_site_items', {
          url: '/settings_site_items',
          templateUrl: 'build/html/SettingsSiteItemsView.html',
          controller: 'SettingsSiteItems',
          pageName: "Site cameras",
          category: "Settings"
        })
        .state('settings_site_members', {
          url: '/settings_site_members',
          templateUrl: 'build/html/SettingsSiteMembersView.html',
          controller: 'SettingsSiteMembers',
          pageName: "Site Members",
          category: "Settings"
        })
        .state('settings_site_members.id', {
          url: ':siteId'
        })
        .state('settings_sites', {
          url: '/settings/sites',
          template: '<fca-settings-sites></fca-settings-sites>',
          pageName: "Sites management",
          category: "Settings"
        })
        .state('settings_sites_new', {
          url: '/settings/sites/new',
          template: '<fca-settings-sites-new></fca-settings-sites-new>',
          pageName: "New site",
          category: "Settings"
        })
        .state('settings_sites_edit', {
          url: '/settings/sites/:siteId/edit',
          template: '<fca-settings-sites-edit site="$resolve.site"></fca-settings-sites-edit>',
          resolve: {
            site: ["$stateParams", "dataNodeService", function ($stateParams, dataNodeService) {
              return dataNodeService.getDataNodeById($stateParams.siteId);
            }],
          },
          pageName: "Edit site",
          category: "Settings"
        })
        .state('settings_users', {
          url: '/settings/users',
          template: '<fca-settings-users></fca-settings-users>',
          pageName: "Users management",
          category: "Settings"
        })
        .state('settings_users_new', {
          url: '/settings/users/new',
          template: '<fca-settings-users-new></fca-settings-users-new>',
          pageName: "New user",
          category: "Settings"
        })
        .state('settings_users_edit', {
          url: '/settings/users/:userId/edit',
          template: '<fca-settings-users-edit user="$resolve.user"></fca-settings-users-edit>',
          resolve: {
            user: ["$stateParams", "userService", function ($stateParams, userService) {
              return userService.getUserById($stateParams.userId);
            }],
          },
          pageName: "Edit user",
          category: "Settings"
        })
        .state('settings_per_site', {
          url: '/settings_per_site',
          templateUrl: 'build/html/SettingsPerSiteView.html',
          controller: 'SettingsPerSite',
          pageName: "Per Site management",
          category: "Settings"
        })
        .state('settings_per_site.id', {
          url: ':siteId'
        })
        .state('settings_users_sites', {
          url: '/settings_users_sites',
          templateUrl: 'build/html/SettingsUsersSitesView.html',
          controller: 'SettingsUsersSites',
          pageName: "Users - Sites management",
          category: "Settings"
        })
        .state('settings_per_user', {
          url: '/settings_per_user/:userId?',
          templateUrl: 'build/html/SettingsPerUserView.html',
          controller: 'SettingsPerUser',
          pageName: "Per User management",
          category: "Settings"
        });
    }
  ]);
}());
