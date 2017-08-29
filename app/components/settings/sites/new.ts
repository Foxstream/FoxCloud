import { IAngularStatic } from "angular";
import { IStateService } from "angular-ui-router";
import { DATA_NODE_SERVICE_TOKEN, DataNodeService } from "../../../services/data-node-service";
import { CompoundNode } from "../../../types/object/compound-node";
import { DisplayName } from "../../../types/scalars/display-name";
import { UserId } from "../../../types/scalars/user-id";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the settings/sites/edit component.
 * This corresponds to the "Angular name" for this component.
 */
export const SETTINGS_SITES_NEW_TOKEN: string = "fcaSettingsSitesNew";

angular.module("FSCounterAggregatorApp").component(SETTINGS_SITES_NEW_TOKEN, {
  templateUrl: "build/html/sites/new.html",
  controller: [
    "$state",
    DATA_NODE_SERVICE_TOKEN,
    class {
      displayName: DisplayName;
      ownerId: UserId | undefined;

      private $state: IStateService;
      private dataNodeService: DataNodeService;

      constructor($state: IStateService, dataNodeService: DataNodeService) {
        this.$state = $state;
        this.dataNodeService = dataNodeService;

        this.displayName = "";
      }

      handleSave(): void {
        if (this.ownerId === undefined) {
          alert("Owner is not defined");
          return;
        }

        this.dataNodeService
          .createRootCompoundNode({
            displayName: this.displayName,
            ownerId: this.ownerId,
          })
          .then((compoundNode: CompoundNode): void => {
            this.$state.go("settings_sites");
          })
          .catch((err: Error): void => {
            alert("An error occured during the creation of the compound node, see console for report");
            console.error(err);
          });
      }

      handleCancel(): void {
        this.$state.go("settings_sites");
      }
    },
  ],
});
