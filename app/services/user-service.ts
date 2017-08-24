import {IAngularStatic, IHttpPromiseCallbackArg, IHttpService, IPromise,} from "angular";
import * as urlJoin from "url-join";
import {Myconfig} from "../configuration/myconfig";
import {User, userFromJson, UserJson} from "../types/object/user";
import {DisplayName} from "../types/scalars/display-name";
import {EmailAddress} from "../types/scalars/email-address";
import {UserId} from "../types/scalars/user-id";

declare const angular: IAngularStatic;

export interface UserService {
  createUser(options: CreateUserOptions): IPromise<User>;

  updateUser(userId: UserId, patch: UpdateUserPatch): IPromise<User>;

  setPassword(userId: UserId, options: SetPasswordOptions): IPromise<User>;

  getUserById(userId: UserId): IPromise<User>;

  getUsers(): IPromise<User[]>;
}

/**
 * Document describing the user to create.
 */
export interface CreateUserOptions {
  email: EmailAddress;
  displayName: DisplayName;
  isGlobalAdministrator: boolean;
  appData?: any;
}

/**
 * Document describing the updates to apply to the user.
 */
export interface UpdateUserPatch {
  displayName?: string;
  appData?: any;
}

/**
 * Options for the `setPassword` method of [[UserService]].
 */
export interface SetPasswordOptions {
  /**
   * Old password of the user.
   * This is currently (2017-08-23) unused but is intended to be sent to the server to be verified when updating
   * the password.
   */
  oldPassword: string;

  /**
   * New password to use for the current user.
   */
  password: string;
}

/**
 * @class UserService
 * @memberOf FSCounterAggregatorApp
 * @description Manage users
 */
(function () {
  angular.module("FSCounterAggregatorApp").service("UserService", [
    "$http",
    "myconfig",
    function (
      this: UserService,
      $http: IHttpService,
      myconfig: Myconfig,
    ) {
      /**
       * Creates a new user.
       *
       * @function createUser
       * @memberOf FSCounterAggregatorApp.UserService
       */
      this.createUser = function (options: CreateUserOptions): IPromise<User> {
        const url: string = urlJoin(myconfig.apiUri, "users");
        const data: any = {
          email: options.email,
          display_name: options.displayName,
          is_global_administrator: options.isGlobalAdministrator,
          app_data: options.appData,
        };
        return $http.post(url, data)
          .then<User>((ret: IHttpPromiseCallbackArg<UserJson>): User => userFromJson(ret.data));
      };

      /**
       * Updates the user.
       *
       * @function setSettings
       * @memberOf FSCounterAggregatorApp.UserService
       * @param userId ID of the user to update.
       * @param patch Document describing the updates to apply.
       */
      this.updateUser = function (userId: UserId, patch: UpdateUserPatch): IPromise<User> {
        const url: string = urlJoin(myconfig.apiUri, `users/${userId}`);
        const data: any = {
          display_name: patch.displayName,
          app_data: patch.appData,
        };
        return $http.patch(url, data)
          .then<User>((ret: IHttpPromiseCallbackArg<UserJson>): User => userFromJson(ret.data));
      };

      /**
       * Update the password of the supplied user.
       *
       * @function setPassword
       * @memberOf FSCounterAggregatorApp.UserService
       */
      this.setPassword = function (userId: UserId, options: SetPasswordOptions): IPromise<User> {
        const url: string = urlJoin(myconfig.apiUri, `users/${userId}`);
        const data: any = {
          old_password: options.oldPassword,
          password: options.password,
        };
        console.warn("Old password is not checked when updating the user");
        return $http.patch(url, data)
          .then<User>((ret: IHttpPromiseCallbackArg<UserJson>): User => userFromJson(ret.data));
      };

      /**
       * Get the user corresponding to the provided ID.
       *
       * @function getUserById
       * @memberOf FSCounterAggregatorApp.UserService
       */
      this.getUserById = function (userId: UserId): IPromise<User> {
        const url: string = urlJoin(myconfig.apiUri, `users/${userId}`);
        return $http.get(url)
          .then<User>((ret: IHttpPromiseCallbackArg<UserJson>): User => userFromJson(ret.data));
      };

      /**
       * Get all the users.
       *
       * @function getUsers
       * @memberOf FSCounterAggregatorApp.UserService
       */
      this.getUsers = function (): IPromise<User[]> {
        const url: string = urlJoin(myconfig.apiUri, "users");
        return $http.get(url)
          .then<User[]>((ret: IHttpPromiseCallbackArg<UserJson[]>): User[] => ret.data.map(userFromJson));
      };
    }]);
}());
