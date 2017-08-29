import { IAngularStatic, IHttpResponse, IHttpService, IPromise } from "angular";
import * as urlJoin from "url-join";
import { Myconfig } from "../configuration/myconfig";
import { CompoundNode, compoundNodeFromJson, CompoundNodeJson } from "../types/object/compound-node";
import { User, userFromJson, UserJson } from "../types/object/user";
import { DataNodeId } from "../types/scalars/data-node-id";
import { DisplayName } from "../types/scalars/display-name";
import { UserId } from "../types/scalars/user-id";
import { DataNode, dataNodeFromJson, DataNodeJson } from "../types/unions/data-node";

declare const angular: IAngularStatic;

/**
 * Token used for Angular's dependency injection of the data node service.
 * This corresponds to the "Angular name" for this service.
 */
export const DATA_NODE_SERVICE_TOKEN: string = "dataNodeService";

/**
 * @class DataNodeService
 * @memberOf FSCounterAggregatorApp
 * @description Manage users
 */
export class DataNodeService {
  private $http: IHttpService;
  private myConfig: Myconfig;

  constructor($http: IHttpService, myConfig: Myconfig) {
    this.$http = $http;
    this.myConfig = myConfig;
  }

  /**
   * Creates a new root compound node.
   *
   * @function createRootCompoundNode
   * @memberOf FSCounterAggregatorApp.DataNodeService
   */
  createRootCompoundNode(options: CreateRootCompoundNodeOptions): IPromise<CompoundNode> {
    const url: string = urlJoin(this.myConfig.apiUri, "compound_nodes");
    const data: any = {
      display_name: options.displayName,
      owner_id: options.ownerId,
      parent_id: null,
    };
    return this.$http.post(url, data)
      .then<CompoundNode>((ret: IHttpResponse<CompoundNodeJson>): CompoundNode => compoundNodeFromJson(ret.data));
  }

  /**
   * Creates a new child compound node.
   *
   * @function createChildCompoundNode
   * @memberOf FSCounterAggregatorApp.DataNodeService
   */
  createChildCompoundNode(options: CreateChildCompoundNodeOptions): IPromise<CompoundNode> {
    const url: string = urlJoin(this.myConfig.apiUri, "compound_nodes");
    const data: any = {
      display_name: options.displayName,
      parent_id: options.parentId,
    };
    return this.$http.post(url, data)
      .then<CompoundNode>((ret: IHttpResponse<CompoundNodeJson>): CompoundNode => compoundNodeFromJson(ret.data));
  }

  /**
   * Updates the user.
   *
   * @function updateUser
   * @memberOf FSCounterAggregatorApp.DataNodeService
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

  /**
   * Delete the user.
   *
   * @function deleteUser
   * @memberOf FSCounterAggregatorApp.DataNodeService
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
   * Get the data node corresponding to the provided ID.
   *
   * @function getUserById
   * @memberOf FSCounterAggregatorApp.DataNodeService
   */
  getDataNodeById(dataNodeId: DataNodeId): IPromise<DataNode> {
    const url: string = urlJoin(this.myConfig.apiUri, `data_nodes/${dataNodeId}`);
    return this.$http.get(url)
      .then<DataNode>((ret: IHttpResponse<DataNodeJson>): DataNode => dataNodeFromJson(ret.data));
  }

  /**
   * Get all the compound nodes viewable by the current actor.
   *
   * @function getUsers
   * @memberOf FSCounterAggregatorApp.DataNodeService
   */
  getViewableCompoundNodes(): IPromise<CompoundNode[]> {
    const url: string = urlJoin(this.myConfig.apiUri, "compound_nodes");
    return this.$http.get(url)
      .then<CompoundNode[]>((ret: IHttpResponse<CompoundNodeJson[]>): CompoundNode[] =>
        ret.data.map(compoundNodeFromJson),
      );
  }
}

/**
 * Document describing the root compound node to create.
 */
export interface CreateRootCompoundNodeOptions {
  displayName: DisplayName;
  ownerId: UserId;
}

/**
 * Document describing the child compound node to create.
 */
export interface CreateChildCompoundNodeOptions {
  displayName: DisplayName;
  parentId: DataNodeId;
}

/**
 * Document describing the updates to apply to the user.
 */
export interface UpdateUserPatch {
  displayName?: string;
  appData?: any;
}

angular.module("FSCounterAggregatorApp").service(DATA_NODE_SERVICE_TOKEN, ["$http", "myconfig", DataNodeService]);
