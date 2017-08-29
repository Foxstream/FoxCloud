import { IAngularStatic, IHttpPromiseCallbackArg, IHttpService, IPromise, IQService } from "angular";
import { Myconfig } from "../configuration/myconfig";
import { LegacyItem } from "../legacy-types/objects/legacy-item";
import { LegacySite } from "../legacy-types/objects/legacy-site";
import { CompoundNodeJson } from "../types/object/compound-node";
import { DataNodeId } from "../types/scalars/data-node-id";
import { EmailAddress } from "../types/scalars/email-address";
import { DataNodeJson } from "../types/unions/data-node";

declare const angular: IAngularStatic;

export interface LegacySiteService {
  getSite(siteId: DataNodeId): IPromise<LegacySite>;

  getItem(siteId: DataNodeId, itemId: DataNodeId): IPromise<LegacyItem>;

  getItems(siteId: DataNodeId, items: DataNodeId[]): IPromise<LegacyItem[]>;

  addUser (siteId: DataNodeId, userEmail: EmailAddress, addAsAdmin: boolean): any;

  removeUser (siteId: DataNodeId, userEmail: EmailAddress, isAdmin: boolean): any;

  addItem (siteId: DataNodeId): any;

  removeItem (siteId: DataNodeId, itemId: DataNodeId): any;

  unlinkItem(siteId: DataNodeId, itemId: DataNodeId): any;

  getResource(): any;
}

/**
 * Converts a "compound-node" resource of the v1 API to the legacy "site" format.
 *
 * @param compoundNode Self resource in the API v1 format
 * @return User data in the legacy format used by the application.
 */
function readCompoundNodeJsonAsLegacySite(compoundNode: CompoundNodeJson): LegacySite {
  console.warn("Missing some legacy site mappings: users, admins, items");
  const usersadmin: EmailAddress[] = [];
  const users: EmailAddress[] = [];
  const items: LegacyItem[] = [];
  return {
    _id: compoundNode.id,
    name: compoundNode.display_name,
    usersadmin: usersadmin,
    users: users,
    items: items,
  };
}

/**
 * @class LegacySiteService
 * @memberOf FSCounterAggregatorApp
 * @description Manages sites settings
 */

angular.module("FSCounterAggregatorApp").service("LegacySiteService", [
  "$http",
  "$resource",
  "$q",
  "myconfig",
  function (
    this: LegacySiteService,
    $http: IHttpService,
    $resource: any,
    $q: IQService,
    myconfig: Myconfig,
  ) {

    /**
     * Get a site by ID.
     */
    this.getSite = function (siteId: DataNodeId): IPromise<LegacySite> {
      if (myconfig.debug) {
        return $http.get("assets/sites.json")
          .then<LegacySite>((ret: IHttpPromiseCallbackArg<LegacySite[]>): LegacySite => {
            for (const site of ret.data) {
              if (site._id === siteId) {
                return site;
              }
            }
            throw new Error("Site not found: siteId=" + siteId);
          });
      } else {
        return $http.get("/api/v1/data_nodes/" + siteId)
          .then<LegacySite>((ret: IHttpPromiseCallbackArg<DataNodeJson>) => {
            return readCompoundNodeJsonAsLegacySite(ret.data);
          });
      }
    };

    /**
     * Get an item by ID from the supplied site.
     */
    this.getItem = function (siteId: DataNodeId, itemId: DataNodeId): IPromise<LegacyItem> {
      return this.getSite(siteId)
        .then((site: LegacySite): LegacyItem => {
          for (const item of site.items) {
            if (item._id === itemId) {
              return item;
            }
          }
          throw new Error("Item not found: siteId=" + siteId + ", itemId=" + itemId);
        });
    };

    /**
     * Get the items with an ID in the provided list from the supplied site.
     */
    this.getItems = function (siteId: DataNodeId, items: DataNodeId[]): IPromise<LegacyItem[]> {
      return this.getSite(siteId)
        .then((site: LegacySite) => {
          const result: LegacyItem[] = [];
          for (const item of site.items) {
            if (items.indexOf(item._id) >= 0) {
              result.push(item);
            }
          }
          return result;
        });
    };

    /**
     * Add access permissions to the supplied user.
     */
    this.addUser = function (siteId, userEmail, addAsAdmin) {
      if (myconfig.debug) {
        return $q.when({});
      } else {
        return $http.post("/sites/" + siteId + "/adduser", {
          email: userEmail,
          isAdmin: addAsAdmin,
        }).then(function (ret) {
          return ret.data;
        });
      }
    };

    /**
     * Remove access permissions from the supplied user.
     */
    this.removeUser = function (siteId, userEmail, isAdmin) {
      if (myconfig.debug) {
        return $q.when({});
      } else {
        return $http.post("/sites/" + siteId + "/removeuser", {
          email: userEmail,
          isAdmin: isAdmin,
        }).then(function (ret) {
          return ret.data;
        });
      }
    };

    /**
     * Add a new item to the supplied site.
     */
    this.addItem = function (siteId) {
      if (myconfig.debug) {
        return $q.when({});
      } else {
        return $http.post("/sites/" + siteId + "/additem", {})
          .then(function (ret: IHttpPromiseCallbackArg<any>) {
            return ret.data;
          });
      }
    };

    /**
     * Remove an item from the site.
     */
    this.removeItem = function (siteId, itemId) {
      if (myconfig.debug) {
        return $q.when({});
      } else {
        return $http.post("/sites/" + siteId + "/removeitem/" + itemId, {})
          .then(function (ret: IHttpPromiseCallbackArg<any>) {
            return ret.data;
          });
      }
    };

    /**
     * Set `items[i].itemid` to `null and generate a new `pairid` value for the item `items[i]._id === itemid`.
     */
    this.unlinkItem = function (siteId, itemId) {
      if (myconfig.debug) {
        return $q.when({});
      } else {
        return $http.post("/sites/" + siteId + "/unlinkitem/" + itemId, {})
          .then(function (ret) {
            return ret.data;
          });
      }
    };

    /**
     * Return an Angular resource representing sites.
     */
    this.getResource = function () {
      if (myconfig.debug) {
        return $resource("assets/sites.json");
      } else {
        return $resource(
          "/api/v1/data_nodes/:siteId",
          {siteId: "@_id"},
          {
            get: {
              method: "GET", transformResponse: function (data: string, headersGetter: any, status: any) {
                return readCompoundNodeJsonAsLegacySite(angular.fromJson(data));
              },
            },
            create: {
              method: "POST",
              url: "/api/v1/compound_nodes",
              transformRequest: function (data: any, headersGetter: any): string {
                const createCompoundNodeBody: any = {};

                createCompoundNodeBody.parent_id = null;

                for (const key in data) {
                  if (!data.hasOwnProperty(key)) {
                    continue;
                  }
                  switch (key) {
                    case "name":
                      createCompoundNodeBody.display_name = data.name;
                      break;
                    default:
                      if (key.indexOf("$") === 0) {
                        continue;
                      }
                      console.warn("Unsupported site key " + key + " (ignoring)");
                  }
                }

                return angular.toJson(createCompoundNodeBody);
              },
              transformResponse: function (data: string, headersGetter: any, status: any) {
                return readCompoundNodeJsonAsLegacySite(angular.fromJson(data));
              },
            },
            save: {method: "POST"},
            query: {method: "GET", isArray: true},
            remove: {method: "DELETE"},
            delete: {method: "DELETE"},
          },
        );
      }
    };
  },
]);
