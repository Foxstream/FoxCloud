import { IAngularStatic } from "angular";
import { IStateService } from "angular-ui-router";
import { UpdateUserPatch, UserService } from "../../../services/user-service";
import { User } from "../../../types/object/user";
import { JsonValue } from "../../../types/scalars/json-value";

declare const angular: IAngularStatic;

angular.module("FSCounterAggregatorApp").component("fcaSettingsUsersEdit", {
  templateUrl: "build/html/users/edit.html",
  bindings: {
    user: "<",
  },
  controller: [
    "$state",
    "userService",
    class {
      /**
       * The user being edited.
       * Provided by the parent component through attribute bindings.
       * It available once `$onInit` is called.
       */
      user?: User;

      displayName: string;

      appData: JsonValue;

      private $state: IStateService;
      private userService: UserService;

      constructor($state: IStateService, userService: UserService) {
        this.$state = $state;
        this.userService = userService;

        this.displayName = "";
        this.appData = {};
      }

      $onInit() {
        this.displayName = this.user.displayName;
        this.appData = this.user.appData;
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
        this.userService.updateUser(this.user!.id, patch)
          .then((user: User): void => {
            this.$state.go("settings_users");
          })
          .catch((err: Error): void => {
            alert("An error occured during the update of the user, see console for report");
            console.error(err);
          });
      }

      handleCancel(): void {
        this.$state.go("settings_users");
      }

      /**
       * Create an update patch from the form.
       *
       * @return Update patch with the changes from the form.
       */
      private getPatch(): UpdateUserPatch {
        if (this.user === undefined) {
          throw new Error("Cannot create patch: `user` is not initialized yet.");
        }
        const patch: UpdateUserPatch = {};
        if (this.displayName !== this.user.displayName) {
          patch.displayName = this.displayName;
        }
        if (!angular.equals(this.appData, this.user.appData)) {
          patch.appData = JSON.parse(angular.toJson(this.appData));
        }
        return patch;
      }
    },
  ],
});
