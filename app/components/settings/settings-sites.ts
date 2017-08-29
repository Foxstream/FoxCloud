import { IAngularStatic } from "angular";
import { toResolvableArray } from "../../utils/resolvable";
import { DATA_NODE_SERVICE_TOKEN, DataNodeService } from "../../services/data-node-service";
import { CompoundNode } from "../../types/object/compound-node";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the settings/sites component.
 * This corresponds to the "Angular name" for this component.
 */
export const SETTINGS_SITES_TOKEN: string = "fcaSettingsSites";

/**
 * The state of the list item for a given user.
 */
interface ListItem {
  readonly site: CompoundNode;
  isSelected: boolean;
}

/**
 * @class SettingsUsers
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages users settings
 * require administrator rights
 */
angular.module("FSCounterAggregatorApp").component(SETTINGS_SITES_TOKEN, {
  templateUrl: "build/html/settings-sites.html",
  controller: [
    DATA_NODE_SERVICE_TOKEN,
    "DTOptionsBuilder",
    "DTColumnDefBuilder",
    class {
      /**
       * Boolean indicating if all the elements are selected, even those on the other pages.
       * @readonly
       */
      isAllSelected: boolean;

      /**
       * Count of selected items.
       * @readonly
       */
      selectedCount: number;

      /**
       * List of sites with state data (selection state).
       * @readonly
       */
      siteList: ListItem[];

      /**
       * Options for  `angular-datatables`.
       */
      dtOptions: any;

      /**
       * Options for `angular-datatables`.
       */
      dtColumnDefs: any;

      private dataNodeService: DataNodeService;

      /* tslint:disable-next-line:variable-name */
      constructor(dataNodeService: DataNodeService, DTOptionsBuilder: any, DTColumnDefBuilder: any) {
        this.dataNodeService = dataNodeService;

        this.isAllSelected = false;
        this.selectedCount = 0;

        this.dtOptions = DTOptionsBuilder.newOptions()
          .withOption("order", [[1, "asc"]])
          .withBootstrap();

        this.dtColumnDefs = [
          DTColumnDefBuilder.newColumnDef(0).notSortable(),
          DTColumnDefBuilder.newColumnDef(1),
          DTColumnDefBuilder.newColumnDef(2),
          DTColumnDefBuilder.newColumnDef(3),
          DTColumnDefBuilder.newColumnDef(4),
          DTColumnDefBuilder.newColumnDef(5).notSortable(),
        ];

        this.siteList = toResolvableArray(dataNodeService.getViewableCompoundNodes()
          .then((compoundNodes: CompoundNode[]): ListItem[] => {
            const result: ListItem[] = [];
            for (const compoundNode of compoundNodes) {
              result.push({site: compoundNode, isSelected: false});
            }
            return result;
          }),
        );
      }

      /**
       * Handles the user action of toggling the `isAllSelected` checkbox.
       */
      handleIsAllSelectedChange(): void {
        for (const item of this.siteList) {
          item.isSelected = this.isAllSelected;
        }
        this.selectedCount = this.isAllSelected ? this.siteList.length : 0;
      }

      /**
       * Handles the user action of toggling the `isSelected` checkbox for an item.
       */
      handleItemIsSelectedChange(): void {
        this.selectedCount = 0;
        for (const item of this.siteList) {
          if (item.isSelected) {
            this.selectedCount++;
          }
        }
        this.isAllSelected = this.selectedCount === this.siteList.length;
      }
    },
  ],
});
