import { IAngularStatic, ICompileService, IIntervalService, IScope } from "angular";
import { LegacyUserService } from "../../services/legacy-user-service";
import { UserService } from "../../services/user-service";
import { User } from "../../types/object/user";
import { toResolvableArray } from "../../utils/resolvable";

declare const angular: IAngularStatic;

interface SettingsUsersScope {
  /**
   * Object holding data about the selection.
   * This is mainly introduced to avoid primitive data directly bound to the scope due to intermediate directives
   * preventing proper change detection of the `isAllSelected` checkbox (because of intermediate scopes).
   * This is probably caused by the directives introduced by the `data-tables` module.
   *
   * @see https://stackoverflow.com/a/36167195/2487009
   */
  selectionData: SelectionData;

  /**
   * List of user with state data (selection state).
   * @readonly
   */
  userList: ListItem[];

  /**
   * Options for  `angular-datatables`.
   */
  dtOptions: any;

  /**
   * Options for `angular-datatables`.
   */
  dtColumnDefs: any;

  /**
   * Handles the user action of toggling the `isAllSelected` checkbox.
   */
  handleIsAllSelectedChange(): void;

  /**
   * Handles the user action of toggling the `isSelected` checkbox for an item.
   */
  handleItemIsSelectedChange(): void;
}

/**
 * The state of the list item for a given user.
 */
interface ListItem {
  readonly user: User;
  isSelected: boolean;
}

/**
 * Metadata holding information about the selection.
 */
interface SelectionData {
  /**
   * Boolean indicating if all the elements are selected, even those on the other pages.
   * @readonly
   */
  isAllSelected: boolean;

  /**
   * Count of selected items.
   * @readonly
   */
  count: number;
}

/**
 * @class SettingsUsers
 * @memberof FSCounterAggregatorApp
 * @description Controller that manages users settings
 * require administrator rights
 */
angular.module("FSCounterAggregatorApp").controller("SettingsUsers", [
  "$scope",
  "$compile",
  "$interval",
  "LegacyUserService",
  "userService",
  "DTOptionsBuilder",
  "DTColumnDefBuilder",
  function (
    $scope: IScope & SettingsUsersScope,
    $compile: ICompileService,
    $interval: IIntervalService,
    legacyUserService: LegacyUserService,
    userService: UserService,
    /* tslint:disable-next-line:variable-name */
    DTOptionsBuilder: any,
    /* tslint:disable-next-line:variable-name */
    DTColumnDefBuilder: any,
  ) {
    $scope.selectionData = {
      isAllSelected: false,
      count: 0,
    };

    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withOption("order", [[1, "asc"]])
      .withBootstrap();

    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0).notSortable(),
      DTColumnDefBuilder.newColumnDef(1),
      DTColumnDefBuilder.newColumnDef(2),
      DTColumnDefBuilder.newColumnDef(3),
      DTColumnDefBuilder.newColumnDef(4),
      DTColumnDefBuilder.newColumnDef(5).notSortable(),
    ];

    $scope.userList = toResolvableArray(userService.getUsers()
      .then((users: User[]): ListItem[] => {
        const result: ListItem[] = [];
        for (const user of users) {
          result.push({user, isSelected: false});
        }
        return result;
      }),
    );

    $scope.handleIsAllSelectedChange = function (this: SettingsUsersScope) {
      for (const item of $scope.userList) {
        item.isSelected = $scope.selectionData.isAllSelected;
      }
      $scope.selectionData.count = $scope.selectionData.isAllSelected ? $scope.userList.length : 0;
    };

    $scope.handleItemIsSelectedChange = function (this: SettingsUsersScope) {
      $scope.selectionData.count = 0;
      for (const item of this.userList) {
        if (item.isSelected) {
          $scope.selectionData.count++;
        }
      }
      $scope.selectionData.isAllSelected = $scope.selectionData.count === $scope.userList.length;
    };

    //
    // /**
    //  * A map of the ids of the selected users for faster look-ups.
    //  */
    // const selectedUsers: {[userId: string]: User} = Object.create(null);
    //
    // $scope.itemStates: {[userId: string]: UserState}
    //
    // $scope.selectAll = false;
    // $scope.selectedUsers = [];
    // $scope.selectedLength = 0;
    // $scope.selectedElts = {};
    // $scope.user = undefined;
    // $scope.isNewUser = false;
    // $scope.isEditionMode = false;

    // $scope.toggleAll = function (): void {
    //   $scope.selectAll = !$scope.selectAll;
    //   for (const key in $scope.selectedElts) {
    //     $scope.selectedElts[key].selected = $scope.selectAll;
    //   }
    //   $scope.selectedLength = $scope.selectAll ? $scope.users.length : 0;
    // };
    //
    // $scope.toggleOne = function (id: UserId) {
    //   if ($scope.selectedElts[id].selected) {
    //     $scope.selectedLength++;
    //   } else {
    //     $scope.selectedLength--;
    //   }
    //   $scope.selectAll = $scope.selectedLength === $scope.users.length;
    // };
    //
    // $scope.switchToEditionMode = function () {
    //   $scope.isEditionMode = true;
    // };
    //
    // $scope.switchToListMode = function () {
    //   $scope.isEditionMode = false;
    //   $scope.user = undefined;
    // };
    //
    // $scope.newUser = function () {
    //   $scope.switchToEditionMode();
    //   $scope.isNewUser = true;
    //   $scope.user = {
    //     type: ActorType.User,
    //     id: "ffffffffffffffffffffffff",
    //     displayName: "",
    //     email: "",
    //     isGlobalAdministrator: false,
    //     requirePasswordReset: false,
    //     isEnabled: false,
    //     appData: {},
    //   };
    // };
    //
    // $scope.editUser = function (user) {
    //   $scope.switchToEditionMode();
    //   $scope.isNewUser = false;
    //   $scope.user = user;
    // };
    //
    // $scope.saveUser = function () {
    //   if (!$scope.isNewUser) {
    //     userService.updateUser($scope.user.id, $scope.user!);
    //   } else {
    //     userService.createUser($scope.user)
    //       .then(() => {
    //         $scope.users.push($scope.user!);
    //         $scope.user = undefined;
    //       });
    //   }
    // };
    //
    // $scope.deleteUser = function (user: User): void {
    //   // removeUserFromArray(user);
    //   userService.deleteUser(user.id)
    //     .then(() => {
    //       // if (selectedUserIds[user.id]) {
    //       //   _.remove($scope.selectedUsers, user);
    //       //   delete selectedUserIds[user.id];
    //       // }
    //     })
    //     .catch((err: Error): void => {
    //       // TODO: Insert user back to users list, check for duplicates.
    //       alert("An error occurred during the deletion of the user.\nError:\n" + err);
    //     });
    // };
    //
    // $scope.deleteSelectedUsers = function () {
    //   for (const user of $scope.selectedUsers) {
    //     $scope.deleteUser(user);
    //   }
    // };

    // function removeUserFromArray(user) {
    //   let pos = $scope.users.indexOf(user);
    //   $scope.users.splice(pos, 1);
    //   if ($scope.selectedElts[user._id].selected) {
    //     $scope.selectedLength--;
    //   }
    //   delete $scope.selectedElts[user._id];
    //   $scope.selectAll = $scope.selectedLength == $scope.users.length;
    // }
  },
]);
