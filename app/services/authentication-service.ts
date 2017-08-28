import { IAngularStatic, IHttpPromiseCallbackArg, IHttpService, IPromise, IQService } from "angular";
import * as urlJoin from "url-join";
import { Myconfig } from "../configuration/myconfig";
import { Self, selfFromJson, SelfJson } from "../types/unions/self";

declare const angular: IAngularStatic;

export interface AuthenticationService {
  /**
   * Get data about the current user.
   *
   * The result will be cached.
   *
   * @param useCached If available, use the last value received from the server instead of sending a request.
   *                  Default: `false`.
   */
  getSelf(useCached?: boolean): IPromise<Self>;

  /**
   * Get the currently cached value for the current user.
   *
   * If there is no value yet, returns `undefined`.
   */
  getSelfCached(): Self | undefined;
}

/**
 * @class AuthenticationService
 * @memberOf FSCounterAggregatorApp
 * @description Manage the state of the current user.
 */
angular.module("FSCounterAggregatorApp").service("AuthenticationService", [
  "$http",
  "$q",
  "myconfig",
  function (
    this: AuthenticationService,
    $http: IHttpService,
    $q: IQService,
    myconfig: Myconfig,
  ) {
    /**
     * Cached value of `self`.
     * It is the last value received by the server.
     */
    let _self: Self | undefined;

    /**
     * Get the currently cached value for the current user.
     *
     * The result will be cached.
     *
     * @function getSelf
     * @memberOf FSCounterAggregatorApp.AuthenticationService
     * @param useCached If available, use the last value received from the server instead of sending a request.
     *                  Default: `false`.
     */
    this.getSelf = function (useCached: boolean = false): IPromise<Self> {
      if (_self !== undefined) {
        return $q.resolve(_self);
      }
      const url: string = urlJoin(myconfig.apiUri, "self");
      return $http.get(url)
        .then<Self>((ret: IHttpPromiseCallbackArg<SelfJson>): Self => {
          _self = selfFromJson(ret.data);
          return _self!;
        });
    };

    /**
     * Get the currently cached value for the current user.
     *
     * If there is no value yet, returns `undefined`.
     *
     * @function getSelfCached
     * @memberOf FSCounterAggregatorApp.AuthenticationService
     */
    this.getSelfCached = function (): Self | undefined {
      return _self;
    };
  },
]);
