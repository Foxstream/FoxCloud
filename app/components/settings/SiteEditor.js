/**
 * @class SiteEditor
 */
angular.module('FSCounterAggregatorApp').directive("fcaSiteEditor", function () {
  return {
    restrict: 'E',
    scope: {
      site: '=',
      isNew: '=',
      signal_submit: '&onSubmit',
      signal_close: '&onClose'
    },
    controller: [
      '$scope',
      function (
        $scope
      ) {

        $scope.editor = undefined;
        $scope.forceRefresh = 0;
        $scope.codeValid = true;
        $scope.currentSite = $scope.site;

        function setEditorValue(site) {
          if ($scope.editor !== undefined) {
            if (site !== undefined && site.siteInfo !== undefined) {
              $scope.editor.setValue(angular.toJson(site.siteInfo, true));
            } else {
              $scope.editor.setValue("{}");
            }
          }
        }

        function codemirrorLoaded(instance) {
          $scope.editor = instance;

          $scope.editor.on("change", function (instance) {
            $scope.$evalAsync(function () {
              $scope.codemirrorChanged();
              //++$scope.forceRefresh;
            });
          });

          setEditorValue($scope.currentSite);
        }

        $scope.editorOptions = {
          lineWrapping: true,
          lineNumbers: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          gutters: ["CodeMirror-lint-markers"],
          lint: true,
          mode: {"name": "javascript", "json": true},
          onLoad: codemirrorLoaded
        };

        $scope.isDirty = function () {
          return !angular.equals($scope.currentSite, $scope.site);
        };

        $scope.isCodeValid = function () {
          return $scope.codeValid;
        };

        $scope.codemirrorChanged = function () {
          if ($scope.editor !== undefined && $scope.currentSite !== undefined) {
            // fab: angular pb with dom event must eval or compile
            try {
              if ($scope.editor.getValue() === "{}") {
                $scope.currentSite.siteInfo = undefined;
              } else {
                jsonlint.parse($scope.editor.getValue());
                $scope.currentSite.siteInfo = angular.fromJson($scope.editor.getValue());
              }
              $scope.codeValid = true;
            } catch (err) {
              $scope.codeValid = false;
            }
          }
        };

        $scope.$watch("site", function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.currentSite = angular.copy(newVal);
            setEditorValue($scope.currentSite);
            ++$scope.forceRefresh; // = !$scope.forceRefresh;
          }
        });

        $scope.submit = function () {
          angular.copy($scope.currentSite, $scope.site);
          //$scope.site.siteInfo = angular.fromJson($scope.editor.getValue());
          if ($scope.signal_submit) {
            $scope.signal_submit();
          }
          $scope.close();
        };

        $scope.close = function () {
          if ($scope.signal_close) {
            $scope.signal_close();
          }
        };
      }],
    templateUrl: "build/html/SiteEditor.html"
  };
});
