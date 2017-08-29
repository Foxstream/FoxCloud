import { IAngularStatic } from "angular";
import { IStateService } from "angular-ui-router";
import { DATA_NODE_SERVICE_TOKEN, DataNodeService } from "../../../services/data-node-service";
import { UpdateUserPatch } from "../../../services/user-service";
import { JsonValue } from "../../../types/scalars/json-value";
import { CompoundNode } from "../../../types/object/compound-node";
import { DataNode } from "../../../types/unions/data-node";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the settings/sites/edit component.
 * This corresponds to the "Angular name" for this component.
 */
export const SETTINGS_SITES_EDIT_TOKEN: string = "fcaSettingsSitesEdit";

angular.module("FSCounterAggregatorApp").component(SETTINGS_SITES_EDIT_TOKEN, {
  templateUrl: "build/html/sites/edit.html",
  bindings: {
    site: "<",
  },
  controller: [
    "$state",
    DATA_NODE_SERVICE_TOKEN,
    class {
      /**
       * The site being edited.
       * Provided by the parent component through attribute bindings.
       * It available once `$onInit` is called.
       */
      site?: CompoundNode;

      displayName: string;

      appData: JsonValue;

      private $state: IStateService;
      private dataNodeService: DataNodeService;

      constructor($state: IStateService, dataNodeService: DataNodeService) {
        this.$state = $state;
        this.dataNodeService = dataNodeService;

        this.displayName = "";
        this.appData = {};
      }

      $onInit() {
        this.displayName = this.site.displayName;
        this.appData = this.site.appData;
      }

      /**
       * Checks if the form updates would actually change the user.
       *
       * @return Boolean indicating if the form would change the user data.
       */
      isDirty(): boolean {
        return Object.keys(this.getPatch()).length > 0;
      }

      handleSave(): void {
        const patch: UpdateUserPatch = this.getPatch();
        this.dataNodeService.updateDataNode(this.site!.id, patch)
          .then((dataNode: DataNode): void => {
            this.$state.go("settings_sites");
          })
          .catch((err: Error): void => {
            alert("An error occured during the update of the site, see console for report");
            console.error(err);
          });
      }

      handleCancel(): void {
        this.$state.go("settings_sites");
      }

      /**
       * Create an update patch from the form.
       *
       * @return Update patch with the changes from the form.
       */
      private getPatch(): UpdateUserPatch {
        if (this.site === undefined) {
          throw new Error("Cannot create patch: `site` is not initialized yet.");
        }
        const patch: UpdateUserPatch = {};
        if (this.displayName !== this.site.displayName) {
          patch.displayName = this.displayName;
        }
        if (!angular.equals(this.appData, this.site.appData)) {
          patch.appData = JSON.parse(angular.toJson(this.appData));
        }
        return patch;
      }
    },
  ],
});
