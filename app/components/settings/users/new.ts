import {IAngularStatic} from "angular";
import {IStateService} from "angular-ui-router";
import {UserService} from "../../../services/user-service";
import {User} from "../../../types/object/user";

declare const angular: IAngularStatic;

angular.module("FSCounterAggregatorApp").component("fcaSettingsUsersNew", {
  templateUrl: "build/html/users/new.html",
  controller: [
    "$state",
    "userService",
    class {
      displayName: string;
      email: string;
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
