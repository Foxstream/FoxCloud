import {IAngularStatic, IHttpResponse, IHttpService, IPromise} from "angular";
import * as urlJoin from "url-join";
import {Myconfig} from "../configuration/myconfig";
import {User, userFromJson, UserJson} from "../types/object/user";
import {DisplayName} from "../types/scalars/display-name";
import {EmailAddress} from "../types/scalars/email-address";
import {UserId} from "../types/scalars/user-id";

declare const angular: IAngularStatic;

/**
 * @class UserService
 * @memberOf FSCounterAggregatorApp
 * @description Manage users
 */
export class UserService {
  private $http: IHttpService;
  private myConfig: Myconfig;

  constructor($http: IHttpService, myConfig: Myconfig) {
    this.$http = $http;
    this.myConfig = myConfig;
  }

  /**
   * Creates a new user.
   *
   * @function createUser
   * @memberOf FSCounterAggregatorApp.UserService
   */
  createUser(options: CreateUserOptions): IPromise<User> {
    console.log("creating");
    const url: string = urlJoin(this.myConfig.apiUri, "users");
    const data: any = {
      email: options.email,
      display_name: options.displayName,
      is_global_administrator: options.isGlobalAdministrator,
      app_data: options.appData,
    };
    return this.$http.post(url, data)
      .then<User>((ret: IHttpResponse<UserJson>): User => userFromJson(ret.data));
  }

  /**
   * Updates the user.
   *
   * @function updateUser
   * @memberOf FSCounterAggregatorApp.UserService
   * @param userId ID of the user to update.
   * @param patch Document describing the updates to apply.
   */
  updateUser(userId: UserId, patch: UpdateUserPatch): IPromise<User> {
    const url: string = urlJoin(this.myConfig.apiUri, `users/${userId}`);
    const data: any = {
      display_name: patch.displayName,
      app_data: patch.appData,
    };
    return this.$http.patch(url, data)
      .then<User>((ret: IHttpResponse<UserJson>): User => userFromJson(ret.data));
  }

  deleteUser(userId: UserId): IPromise<void>;

  /**
   * Delete the user.
   *
   * @function deleteUser
   * @memberOf FSCounterAggregatorApp.UserService
   * @param userId ID of the user to delete.
   */
  deleteUser(userId: UserId): IPromise<void> {
    const url: string = urlJoin(this.myConfig.apiUri, `users/${userId}`);
    return this.$http.delete(url)
      .then<void>((ret: IHttpResponse<any>): void => {
        // TODO: Check for error, assert that the server response is as expected.
        return;
      });
  }

  /**
   * Update the password of the supplied user.
   *
   * @function setPassword
   * @memberOf FSCounterAggregatorApp.UserService
   */
  setPassword(userId: UserId, options: SetPasswordOptions): IPromise<User> {
    const url: string = urlJoin(this.myConfig.apiUri, `users/${userId}`);
    const data: any = {
      old_password: options.oldPassword,
      password: options.password,
    };
    console.warn("Old password is not checked when updating the user");
    return this.$http.patch(url, data)
      .then<User>((ret: IHttpResponse<UserJson>): User => userFromJson(ret.data));
  }

  /**
   * Get the user corresponding to the provided ID.
   *
   * @function getUserById
   * @memberOf FSCounterAggregatorApp.UserService
   */
  getUserById(userId: UserId): IPromise<User> {
    const url: string = urlJoin(this.myConfig.apiUri, `users/${userId}`);
    return this.$http.get(url)
      .then<User>((ret: IHttpResponse<UserJson>): User => userFromJson(ret.data));
  };

  /**
   * Get all the users.
   *
   * @function getUsers
   * @memberOf FSCounterAggregatorApp.UserService
   */
  getUsers(): IPromise<User[]> {
    const url: string = urlJoin(this.myConfig.apiUri, "users");
    return this.$http.get(url)
      .then<User[]>((ret: IHttpResponse<UserJson[]>): User[] => ret.data.map(userFromJson));
  }
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

angular.module("FSCounterAggregatorApp").service("userService", ["$http", "myconfig", UserService]);
