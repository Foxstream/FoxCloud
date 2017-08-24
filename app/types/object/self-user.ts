import {ActorType, actorTypeFromJson, actorTypeToJson} from "../enums/actor-type";
import {DisplayName} from "../scalars/display-name";
import {EmailAddress} from "../scalars/email-address";
import {JsonValue} from "../scalars/json-value";
import {UserId} from "../scalars/user-id";
import {DataNode, dataNodeFromJson, DataNodeJson, dataNodeToJson} from "../unions/data-node";

/**
 * Represents the currently authenticated user.
 */
export interface SelfUser {
  type: ActorType.User;
  id: UserId;
  displayName: DisplayName;
  email: EmailAddress;
  isGlobalAdministrator: boolean;
  isEnabled: boolean;
  appData: JsonValue;
  dataNodes: DataNode[];
}

/**
 * JSON-safe result when retrieving information about the current user while authenticated as a user.
 */
export interface SelfUserJson {
  type: "user";
  id: UserId;
  is_global_administrator: boolean;
  email: EmailAddress;
  is_enabled: boolean;
  display_name: DisplayName;
  app_data: JsonValue;
  data_nodes: DataNodeJson[];
}

export function selfUserFromJson(selfUserJson: SelfUserJson): SelfUser {
  return {
    type: actorTypeFromJson(selfUserJson.type) as ActorType.User,
    id: selfUserJson.id,
    displayName: selfUserJson.display_name,
    email: selfUserJson.email,
    isGlobalAdministrator: selfUserJson.is_global_administrator,
    isEnabled: selfUserJson.is_enabled,
    appData: selfUserJson.app_data,
    dataNodes: selfUserJson.data_nodes.map(dataNodeFromJson),
  };
}

export function selfUserToJson(selfUser: SelfUser): SelfUserJson {
  return {
    type: actorTypeToJson(selfUser.type) as "user",
    id: selfUser.id,
    display_name: selfUser.displayName,
    email: selfUser.email,
    is_global_administrator: selfUser.isGlobalAdministrator,
    is_enabled: selfUser.isEnabled,
    app_data: selfUser.appData,
    data_nodes: selfUser.dataNodes.map(dataNodeToJson),
  };
}
