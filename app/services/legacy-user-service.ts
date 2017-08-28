import {IAngularStatic, IHttpService, IPromise, IQService} from "angular";
import {LoDashStatic} from "lodash";
import * as urlJoin from "url-join";
import {Myconfig} from "../configuration/myconfig";
import {LegacyUser, legacyUserFromUser} from "../legacy-types/objects/legacy-user";
import {LegacyUserSettings, legacyUserSettingsFromSelfUser} from "../legacy-types/objects/legacy-user-settings";
import {LegacyVisibleSite} from "../legacy-types/objects/legacy-visible-site";
import {ActorType} from "../types/enums/actor-type";
import {User} from "../types/object/user";
import {DataNodeId} from "../types/scalars/data-node-id";
import {UserId} from "../types/scalars/user-id";
import {Self} from "../types/unions/self";
import {AuthenticationService} from "./authentication-service";
import {CreateUserOptions, SetPasswordOptions, UpdateUserPatch, UserService} from "./user-service";

declare const angular: IAngularStatic;
declare const _: LoDashStatic;

export interface LegacyUserService {
  currentUserData: Partial<LegacyUserSettings>;

  /**
   * @param useCached Use the cached value. Default: `true`
   * @return The legacy settings for the current user.
   */
  getSettings(useCached?: boolean): IPromise<LegacyUserSettings>;

  setSettings (params: any): any;

  /**
   * Update the password of the current user.
   *
   * @param options Options for the password update. It includes the old password (`oldPassword`) and new password
   *                (`password`).
   * @return The updated user.
   */
  setPassword(options: LegacySetPasswordOptions): IPromise<LegacyUserSettings>;

  getResource(): LegacyUserResourceConstructor;

  getSiteFromId<S extends LegacyVisibleSite>(siteLists: S[], id: DataNodeId): S | undefined;

  getCachedSettings(): Partial<LegacyUserSettings>;

  getIdOfFirstSiteWithAdminRights(sites: LegacyVisibleSite[]): DataNodeId | null;

  getFirstSiteAdmin (siteLists: LegacyVisibleSite[]): LegacyVisibleSite | undefined;

  isSiteHaveHeatmap(site: LegacyVisibleSite): boolean;

  isSiteAdmin(site: LegacyVisibleSite): boolean;
}

/**
 * Options for the `setPassword` method of [[UserService]].
 */
export interface LegacySetPasswordOptions {
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

export interface LegacyUserResourceConstructor {
  new(...args: any[]): LegacyUserResource;

  get(params: {_id: UserId}, cb?: any): LegacyUserResource;

  query(cb?: any): LegacyUserResourceArray;
}

export interface LegacyUserResourceArray extends ArrayLike<LegacyUserResource> {
  $resolved: boolean;

  $promise: IPromise<this>;
}

export interface LegacyUserResource {
  $resolved: boolean;

  $promise: IPromise<this>;

  $create(): any;

  $delete(): any;

  $resetPassword(): any;

  $save(): any;
}

/**
 * @class LegacyUserService
 * @memberOf FSCounterAggregatorApp
 * @description Get User settings from server
 */
(function () {
  angular.module("FSCounterAggregatorApp").service("LegacyUserService", [
    "$http",
    "$resource",
    "$q",
    "myconfig",
    "userService",
    "AuthenticationService",
    function (
      this: LegacyUserService,
      $http: IHttpService,
      $resource: any,
      $q: IQService,
      myconfig: Myconfig,
      userService: UserService,
      authenticationService: AuthenticationService,
    ) {
      this.currentUserData = {};

      /**
       * @function getSettings
       * @memberOf FSCounterAggregatorApp.LegacyUserService
       * @description retrieve the user settings and cache them
       */
      this.getSettings = function (useCached: boolean = false): IPromise<LegacyUserSettings> {
        return authenticationService.getSelf(useCached)
          .then<LegacyUserSettings>((self: Self) => {
            if (self.type !== ActorType.User) {
              throw new Error("FailedAssertion: Expected `self` to be an authenticated user");
            }
            this.currentUserData = legacyUserSettingsFromSelfUser(self);
            return this.currentUserData as LegacyUserSettings;
          });
      };

      /**
       * @function setSettings
       * @memberOf FSCounterAggregatorApp.LegacyUserService
       * @description Update the display name of the user.
       * @param params {{username: string}}
       */
      this.setSettings = function (this: LegacyUserService, params: any): IPromise<LegacyUserSettings> {
        if (myconfig.debug) {
          return this.getSettings(true);
        }
        return authenticationService.getSelf(true)
          .then((self: Self) => {
            if (self.type !== ActorType.User) {
              throw new Error("FailedAssertion: Expected `self` to be an authenticated user");
            }
            const patch: UpdateUserPatch = {};
            for (const key in params) {
              if (!params.hasOwnProperty(key)) {
                continue;
              }
              switch (key) {
                case "username":
                  patch.displayName = params.username;
                  break;
                default:
                  console.warn("Ignoring update of unsupported key: " + key);
              }
            }
            return userService.updateUser(self.id, patch);
          })
          .then((_) => this.getSettings(false));
      };

      /**
       * @function setPassword
       * @memberOf FSCounterAggregatorApp.LegacyUserService
       * @description change the current user password
       */
      this.setPassword = function (
        this: LegacyUserService,
        params: LegacySetPasswordOptions,
      ): IPromise<LegacyUserSettings> {
        if (myconfig.debug) {
          return this.getSettings(true);
        }
        return authenticationService.getSelf(true)
          .then((self: Self) => {
            if (self.type !== ActorType.User) {
              throw new Error("FailedAssertion: Expected `self` to be an authenticated user");
            }
            const options: SetPasswordOptions = {
              oldPassword: params.oldpassword,
              password: params.password,
            };
            return userService.setPassword(self.id, options);
          })
          .then((_) => this.getSettings(false));
      };

      /**
       * @function getCachedSettings
       * @memberOf FSCounterAggregatorApp.LegacyUserService
       * @description get the cached user settings (a call to getSettings must be done previously)
       */
      this.getCachedSettings = function (this: LegacyUserService): Partial<LegacyUserSettings> {
        const cachedSelf: Self | undefined = authenticationService.getSelfCached();
        if (cachedSelf.type !== ActorType.User) {
          throw new Error("FailedAssertion: Expected `self` to be an authenticated user");
        }
        return cachedSelf === undefined ? {} : legacyUserSettingsFromSelfUser(cachedSelf);
      };

      this.getResource = function (): LegacyUserResourceConstructor {
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
        }

        const userResourceConstructor: LegacyUserResourceConstructor = $resource(urlJoin(myconfig.apiUri, "users"));

        userResourceConstructor.get = function(this: LegacyUser, params: {_id: UserId}): any {
          const result: LegacyUserResource = Object.create(userResourceConstructor.prototype);
          result.$resolved = false;
          result.$promise = userService.getUserById(params._id)
            .then((user: User) => {
              angular.extend(result, user);
              result.$resolved = true;
              return result;
            });
          return result;
        };

        userResourceConstructor.query = function(this: LegacyUser, cb?: any): LegacyUserResourceArray {
          const result: LegacyUserResourceArray = [] as any;
          // = Object.create(userResourceConstructor.prototype);
          result.$resolved = false;
          result.$promise = userService.getUsers()
            .then((users: User[]) => {
              for (const user of users) {
                const resource: LegacyUserResource = Object.create(userResourceConstructor.prototype);
                resource.$promise = $q.resolve(resource);
                resource.$resolved = true;
                angular.extend(resource, legacyUserFromUser(user));
                (result as any).push(resource);
              }
              result.$resolved = true;
              if (cb !== undefined) {
                try {
                  cb(result);
                } catch (err) {
                  console.error(err);
                }
              }
              return result;
            });
          return result;
        };

        userResourceConstructor.prototype.$create = function(this: LegacyUser) {
          const options: CreateUserOptions = {
            displayName: this.name,
            email: this.email,
            isGlobalAdministrator: this.admin,
            appData: this.userInfo,
          };
          return userService.createUser(options)
            .then(legacyUserFromUser);
        };

        userResourceConstructor.prototype.$save = function(this: LegacyUser) {
          const patch: UpdateUserPatch = {
            displayName: this.name,
            appData: this.userInfo,
          };
          return userService.updateUser(this._id, patch)
            .then(legacyUserFromUser);
        };

        userResourceConstructor.prototype.$delete = function(this: LegacyUser) {
          return $q.reject(new Error("Not implemented: delete"));
        };

        userResourceConstructor.prototype.$resetPassword = function(this: LegacyUser) {
          return $q.reject(new Error("Not implemented: reset password"));
        };

        return userResourceConstructor;
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
