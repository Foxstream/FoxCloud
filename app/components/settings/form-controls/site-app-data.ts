import { IAngularStatic, IAttributes, IDirective, INgModelController, IScope } from "angular";
import { Editor } from "codemirror";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the settings/form-controls/site-app-data component.
 * This corresponds to the "Angular name" for this component.
 */
export const SETTINGS_FORM_CONTROLS_SITE_APP_DATA: string = "fcaSettingsFormControlsSiteAppData";

interface UserAppDataScope {
  data: {
    general: string;
  };
  /**
   * Unique number, changing its value triggers an UI refresh.
   */
  forceRefresh: number;
  generalEditorOptions: any;
  generalEditor: undefined | Editor;
}

const DEFAULT_GENERAL: string = angular.toJson({foo: 2}, true);

angular.module("FSCounterAggregatorApp").directive(SETTINGS_FORM_CONTROLS_SITE_APP_DATA,
  (): IDirective => {
    return {
      restrict: "E",
      templateUrl: "build/html/form-controls/site-app-data.html",
      require: "ngModel",
      link: function (
        scope: IScope & UserAppDataScope,
        element: JQLite,
        attrs: IAttributes,
        ngModel: INgModelController,
      ): void {

        scope.data = {
          general: DEFAULT_GENERAL,
        };
        scope.forceRefresh = 0;
        scope.generalEditor = undefined;

        function refreshGeneralEditorView() {
          scope.$applyAsync(() => {
            if (scope.generalEditor !== undefined) {
              scope.generalEditor.refresh();
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
            console.log(editor);
            scope.generalEditor = editor;
            refreshGeneralEditorView();
          },
        };

        //////////////////////
        // Bindings         //
        //////////////////////

        // Binding from ngModel to view
        ngModel.$render = () => {
          scope.data.general = angular.toJson(ngModel.$viewValue, true);
        };

        // Binding from view (general) to ngModel
        scope.$watch("data.general", (general: string): void => {
          refreshGeneralEditorView();
          let generalJson: any;
          try {
            generalJson = angular.fromJson(general);
            ngModel.$setValidity("syntax", true);
          } catch (err) {
            ngModel.$setValidity("syntax", false);
            return;
          }
          ngModel.$setViewValue(generalJson);
        }, true);
      },
    };
  },
);
