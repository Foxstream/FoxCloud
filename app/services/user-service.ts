import {IAngularStatic, IHttpPromiseCallbackArg, IHttpService, IPromise, IQService} from "angular";
import {LoDashStatic} from "lodash";
import {Myconfig} from "../configuration/myconfig";
import {LegacyCurrentUser} from "../legacy-types/objects/legacy-current-user";
import {LegacyUser} from "../legacy-types/objects/legacy-user";
import {LegacyVisibleSite} from "../legacy-types/objects/legacy-visible-site";
import {UserJson} from "../types/object/user";
import {DataNodeId} from "../types/scalars/data-node-id";
import {SelfJson} from "../types/unions/self";

declare const angular: IAngularStatic;
declare const _: LoDashStatic;

export interface UserService {
  getSettings(): IPromise<LegacyCurrentUser>;

  setSettings (params: any): any;

  /**
   * Update the password of the current user.
   *
   * @param options Options for the password update. It includes the old password (`oldpassword`) and new password
   *                (`password`).
   * @return The updated user.
   */
  setPassword(options: SetPasswordOptions): IPromise<LegacyCurrentUser>;

  getResource(): any;

  getSiteFromId<S extends LegacyVisibleSite>(siteLists: S[], id: DataNodeId): S | undefined;

  getCachedSettings(): Partial<LegacyCurrentUser>;

  getIdOfFirstSiteWithAdminRights(sites: LegacyVisibleSite[]): DataNodeId | null;

  getFirstSiteAdmin (siteLists: LegacyVisibleSite[]): LegacyVisibleSite | undefined;

  isSiteHaveHeatmap(site: LegacyVisibleSite): boolean;

  isSiteAdmin(site: LegacyVisibleSite): boolean;
}

interface PrivateUserService extends UserService {
  currentUserData: Partial<LegacyCurrentUser>;
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
  oldpassword: string;

  /**
   * New password to use for the current user.
   */
  password: string;
}

/**
 * @class UserService
 * @memberOf FSCounterAggregatorApp
 * @description Get User settings from server
 */
(function () {

  /**
   * Converts a "self" resource of the v1 API (ie. `/api/v1/self`) to the legacy format (`/users/current`).
   *
   * @param self Self resource in the API v1 format
   * @return User data in the legacy format used by the application.
   */
  function readSelfJsonAsLegacyCurrentUser(self: SelfJson): LegacyCurrentUser {
    if (self.type !== "user") {
      throw new Error("Unsupported actor type, expected `user` but received: " + self.type);
    }
    const user: LegacyUser = {
      _id: self.id,
      admin: self.is_global_administrator,
      email: self.email,
      enabled: self.is_enabled,
      name: self.display_name,
      userInfo: self.app_data,
    };
    const sites: LegacyVisibleSite[] = [];
    for (const dataNode of self.data_nodes) {
      console.warn("Assuming `isadmin`");
      sites.push({
        _id: dataNode.id,
        isadmin: true,
        items: [],
        siteInfo: dataNode.app_data,
      });
    }

    return {user: user, sites: sites};
  }

  /**
   * Converts a "user" resource of the v1 API (ie. `/api/v1/users/...`) to the legacy format (`/users/...`).
   *
   * @param apiUser user resource in the API v1 format
   * @return User data in the legacy format used by the application.
   */
  function readUserJsonAsLegacyUser(apiUser: UserJson): LegacyUser {
    if (apiUser.type !== "user") {
      throw new Error("Unsupported actor type, expected `user` but received: " + apiUser.type);
    }
    return {
      _id: apiUser.id,
      admin: apiUser.is_global_administrator,
      email: apiUser.email,
      enabled: apiUser.is_enabled,
      name: apiUser.display_name,
      userInfo: apiUser.app_data,
    };
  }

  angular.module("FSCounterAggregatorApp").service("UserService", [
    "$http",
    "$resource",
    "$q",
    "myconfig",
    function (
      this: PrivateUserService,
      $http: IHttpService,
      $resource: any,
      $q: IQService,
      myconfig: Myconfig,
    ) {
      this.currentUserData = {};

      /**
       * @function getSettings
       * @memberOf FSCounterAggregatorApp.UserService
       * @description retrieve the user settings and cached them
       */
      this.getSettings = function (this: PrivateUserService): IPromise<LegacyCurrentUser> {
        const url: string = myconfig.debug ? "assets/userdata.json" : "/api/v1/self";
        return $http.get(url)
          .then<LegacyCurrentUser>((ret: IHttpPromiseCallbackArg<SelfJson>): LegacyCurrentUser => {
            const legacyUser: LegacyCurrentUser = readSelfJsonAsLegacyCurrentUser(ret.data);
            this.currentUserData = legacyUser;
            return legacyUser;
          });
      };

      /**
       * @function setSettings
       * @memberOf FSCounterAggregatorApp.UserService
       * @description Update the display name of the user.
       * @param params {{username: string}}
       */
      this.setSettings = function (this: PrivateUserService, params: any): any {
        if (myconfig.debug) {
          return this.getSettings();
        } else {
          const body: any = {};
          for (const key in params) {
            if (!params.hasOwnProperty(key)) {
              continue;
            }
            switch (key) {
              case "username":
                body.display_name = params.username;
                break;
              default:
                console.warn("Update is not supported for the user key " + key + " (ignoring)");
            }
          }
          return $http.patch("/api/v1/users/" + this.currentUserData.user._id, body);
        }
      };

      /**
       * @function setPassword
       * @memberOf FSCounterAggregatorApp.UserService
       * @description change the current user password
       */
      this.setPassword = function (this: PrivateUserService, params: SetPasswordOptions): IPromise<LegacyCurrentUser> {
        if (myconfig.debug) {
          return this.getSettings();
        } else {
          const oldPassword: string = params.oldpassword;
          const password: string = params.password;
          console.warn("Old password is not checked when updating the user");
          return $http.patch("/api/v1/users/" + this.currentUserData.user._id, {password: password})
            .then<LegacyCurrentUser>((ret: IHttpPromiseCallbackArg<UserJson>): LegacyCurrentUser => {
              return this.currentUserData as LegacyCurrentUser;
            });
        }
      };

      /**
       * @function getCachedSettings
       * @memberOf FSCounterAggregatorApp.UserService
       * @description get the cached user settings (a call to getSettings must be done previously)
       */
      this.getCachedSettings = function (this: PrivateUserService): Partial<LegacyCurrentUser> {
        return this.currentUserData;
      };

      this.getResource = function () {
        if (myconfig.debug) {

          const fakeResource: any = $resource("assets/users.json");
          angular.extend(fakeResource.prototype,
            {
              $save: function () {
                return {};
              },
              $delete: function () {
                return {};
              },
              $resetPassword: function () {
                return {};
              },
            });
          return fakeResource;
          // return $resource('assets/users.json');
        } else {
          return $resource(
            "/api/v1/users/:userId",
            {userId: "@_id"},
            {
              get: {
                method: "GET",
                transformResponse: function (data: string, headersGetter: any, status: any): LegacyUser {
                  return readUserJsonAsLegacyUser(angular.fromJson(data));
                },
              },
              create: {
                method: "POST",
                transformRequest: function (data: any, headersGetter: any) {
                  const mapped: any = {};

                  for (const key in data) {
                    if (!data.hasOwnProperty(key)) {
                      continue;
                    }
                    switch (key) {
                      case "userInfo":
                        mapped.app_data = data.userInfo;
                        break;
                      case "name":
                        mapped.display_name = data.name;
                        break;
                      case "email":
                        mapped.email = data.email;
                        break;
                      case "admin":
                        mapped.is_global_administrator = data.admin;
                        break;
                      default:
                        if (key.indexOf("$") === 0) {
                          continue;
                        }
                        console.warn("Unsupported user key " + key + " (ignoring)");
                    }
                  }
                  return angular.toJson(mapped);
                },
                transformResponse: function (data: string, headersGetter: any, status: any) {
                  return readUserJsonAsLegacyUser(angular.fromJson(data));
                },
              },
              save: {
                method: "PATCH",
                transformRequest: function (data: LegacyUser, headersGetter: any): string {
                  const updateUserBody: any = {};

                  for (const key in data) {
                    if (!data.hasOwnProperty(key)) {
                      continue;
                    }
                    switch (key) {
                      case "userInfo":
                        updateUserBody.app_data = data.userInfo;
                        break;
                      case "name":
                        updateUserBody.display_name = data.name;
                        break;
                      default:
                        if (key.indexOf("$") === 0) {
                          continue;
                        }
                        console.warn("Update is not supported for the user key " + key + " (ignoring)");
                    }
                  }
                  return angular.toJson(updateUserBody);
                },
                transformResponse: function (data: string, headersGetter: any, status: any): LegacyUser {
                  return readUserJsonAsLegacyUser(angular.fromJson(data));
                },
              },
              query: {
                method: "GET",
                isArray: true,
                transformResponse: function (data: string, headersGetter: any, status: any): LegacyUser[] {
                  const apiUsers: UserJson[] = angular.fromJson(data);
                  const legacyUsers: LegacyUser[] = [];
                  for (const userJson of apiUsers) {
                    legacyUsers.push(readUserJsonAsLegacyUser(userJson));
                  }
                  return legacyUsers;
                },
              },
              remove: {
                method: "DELETE",
                transformResponse: function (data: string, headersGetter: any, status: any) {
                  console.log("remove");
                  console.log(data);
                  return data;
                },
              },
              delete: {
                method: "DELETE",
                transformResponse: function (data: string, headersGetter: any, status: any) {
                  console.log("delete");
                  console.log(data);
                  return data;
                },
              },
              resetPassword: {
                method: "POST",
                url: "/api/v1/users/:userId/passwordreset",
                transformResponse: function (data: string, headersGetter: any, status: any) {
                  console.log("resetPassword");
                  console.log(data);
                  return data;
                },
              },
            },
          );
        }
      };

      this.getIdOfFirstSiteWithAdminRights = function (siteLists?: LegacyVisibleSite[]): DataNodeId | null {
        if (!siteLists) {
          return null;
        }
        const elem: LegacyVisibleSite | undefined = _.find(siteLists, ["isadmin", true]);
        return elem !== undefined ? elem._id : null;
      };

      this.getSiteFromId = function <S extends LegacyVisibleSite>(siteLists: S[], id: DataNodeId): S | undefined {
        return _.find(siteLists, ["_id", id]);
      };

      this.getFirstSiteAdmin = function (siteLists: LegacyVisibleSite[]): LegacyVisibleSite | undefined {
        return _.find(siteLists, ["isadmin", true]);
      };

      this.isSiteAdmin = function (site: LegacyVisibleSite): boolean {
        return site.isadmin;
      };

      this.isSiteHaveHeatmap = function (site: LegacyVisibleSite): boolean {
        return site.siteInfo !== undefined && site.siteInfo.heatmap !== undefined;
      };
    }]);
}());
