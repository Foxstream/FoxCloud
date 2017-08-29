import { IAngularStatic, IAttributes, IDirective, INgModelController, IScope } from "angular";
import { Editor } from "codemirror";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the settings/form-controls/user-app-data component.
 * This corresponds to the "Angular name" for this component.
 */
export const SETTINGS_FORM_CONTROLS_USER_APP_DATA: string = "fcaSettingsFormControlsUserAppData";

interface UserAppDataScope {
  data: {
    general: string;
    dashboard: string;
  };
  /**
   * Unique number, changing its value triggers an UI refresh.
   */
  forceRefresh: number;
  generalEditorOptions: any;
  generalEditor: undefined | Editor;
  dashboardEditorOptions: any;
  dashboardEditor: undefined | Editor;

  handleGeneralSelection(): void;

  handleDashboardSelection(): void;
}

const DEFAULT_DASHBOARD: string = "";
const DEFAULT_GENERAL: string = angular.toJson({dashboard: DEFAULT_DASHBOARD}, true);

angular.module("FSCounterAggregatorApp").directive(SETTINGS_FORM_CONTROLS_USER_APP_DATA,
  (): IDirective => {
    return {
      restrict: "E",
      templateUrl: "build/html/form-controls/user-app-data.html",
      require: "ngModel",
      link: function (
        scope: IScope & UserAppDataScope,
        element: JQLite,
        attrs: IAttributes,
        ngModel: INgModelController,
      ): void {

        scope.data = {
          general: DEFAULT_GENERAL,
          dashboard: DEFAULT_DASHBOARD,
        };
        scope.forceRefresh = 0;
        scope.generalEditor = undefined;
        scope.dashboardEditor = undefined;

        function refreshGeneralEditorView() {
          scope.$applyAsync(() => {
            if (scope.generalEditor !== undefined) {
              scope.generalEditor.refresh();
            }
            scope.forceRefresh++;
          });
        }

        function refreshDashboardEditorView() {
          scope.$applyAsync(() => {
            if (scope.dashboardEditor !== undefined) {
              scope.dashboardEditor.refresh();
            }
            scope.forceRefresh++;
          });
        }

        scope.generalEditorOptions = {
          lineWrapping: true,
          lineNumbers: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          autoRefresh: true,
          gutters: ["CodeMirror-lint-markers"],
          lint: true,
          mode: {name: "javascript", json: true},
          onLoad: (editor: Editor) => {
            scope.generalEditor = editor;
            refreshGeneralEditorView();
          },
        };

        scope.dashboardEditorOptions = {
          lineWrapping: true,
          lineNumbers: true,
          autoRefresh: true,
          gutters: ["CodeMirror-lint-markers"],
          lint: true,
          htmlMode: true,
          matchClosing: true,
          mode: {name: "xml"},
          onLoad: (editor: Editor) => {
            scope.dashboardEditor = editor;
            refreshDashboardEditorView();
          },
        };

        scope.handleGeneralSelection = refreshGeneralEditorView;
        scope.handleDashboardSelection = refreshDashboardEditorView;

        //////////////////////
        // Bindings         //
        //////////////////////

        // Binding from ngModel to view
        ngModel.$render = () => {
          scope.data.general = angular.toJson(ngModel.$viewValue, true);
          scope.data.dashboard = ngModel.$viewValue.dashboard !== undefined ?
            String(ngModel.$viewValue.dashboard) :
            DEFAULT_DASHBOARD;
        };

        // Binding from view (general) to ngModel
        scope.$watch("data.general", (general: string): void => {
          let generalJson: any;
          try {
            generalJson = angular.fromJson(general);
            ngModel.$setValidity("syntax", true);
          } catch (err) {
            ngModel.$setValidity("syntax", false);
            return;
          }
          if (generalJson.dashboard !== scope.data.dashboard && generalJson.dashboard !== undefined) {
            scope.data.dashboard = String(generalJson.dashboard);
          }
          ngModel.$setViewValue(generalJson);
        }, true);

        // Binding from view (dashboard) to ngModel trough `general`
        scope.$watch("data.dashboard", (dashboard: string): void => {
          // refreshDashboardEditorView();
          let generalJson: any;
          try {
            generalJson = angular.fromJson(scope.data.general);
            ngModel.$setValidity("syntax", true);
          } catch (err) {
            ngModel.$setValidity("syntax", false);
            return;
          }
          if (generalJson.dashboard !== dashboard) {
            generalJson.dashboard = dashboard;
            scope.data.general = angular.toJson(generalJson, true);
            // This will trigger the `data.general` watcher, which will update the view value.
          }
        }, true);
      },
    };
  },
);
