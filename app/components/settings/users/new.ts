import { IAngularStatic } from "angular";
import { IStateService } from "angular-ui-router";
import { USER_SERVICE_TOKEN, UserService } from "../../../services/user-service";
import { User } from "../../../types/object/user";
import { DisplayName } from "../../../types/scalars/display-name";
import { EmailAddress } from "../../../types/scalars/email-address";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the settings/users/new component.
 * This corresponds to the "Angular name" for this component.
 */
export const SETTINGS_USERS_NEW_TOKEN: string = "fcaSettingsUsersNew";

angular.module("FSCounterAggregatorApp").component(SETTINGS_USERS_NEW_TOKEN, {
  templateUrl: "build/html/users/new.html",
  controller: [
    "$state",
    USER_SERVICE_TOKEN,
    class {
      displayName: DisplayName;
      email: EmailAddress;
      isGlobalAdministrator: boolean;

      private $state: IStateService;
      private userService: UserService;

      constructor($state: IStateService, userService: UserService) {
        this.$state = $state;
        this.userService = userService;

        this.displayName = "";
        this.email = "";
        this.isGlobalAdministrator = false;
      }

      handleSave(): void {
        this.userService
          .createUser({
            displayName: this.displayName,
            email: this.email,
            isGlobalAdministrator: this.isGlobalAdministrator,
          })
          .then((user: User): void => {
            this.$state.go("settings_users");
          })
          .catch((err: Error): void => {
            alert("An error occured during the creation of the user, see console for report");
            console.error(err);
          });
      }

      handleCancel(): void {
        this.$state.go("settings_users");
      }
    },
  ],
});
