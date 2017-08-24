import {ActorType, actorTypeFromJson, actorTypeToJson} from "../enums/actor-type";
import {DisplayName} from "../scalars/display-name";
import {EmailAddress} from "../scalars/email-address";
import {JsonValue} from "../scalars/json-value";
import {UserId} from "../scalars/user-id";

/**
 * Represents a user.
 */
export interface User {
  type: ActorType.User;
  id: UserId;
  displayName: DisplayName;
  email: EmailAddress;
  isGlobalAdministrator: boolean;
  requirePasswordReset: boolean;
  isEnabled: boolean;
  appData: JsonValue;
}

/**
 * JSON-safe representation of a user, used to communicate with the API.
 */
export interface UserJson {
  type: "user";
  id: UserId;
  display_name: DisplayName;
  email: EmailAddress;
  is_global_administrator: boolean;
  require_password_reset: boolean;
  is_enabled: boolean;
  app_data: JsonValue;
}

export function userFromJson(userJson: UserJson): User {
  return {
    type: actorTypeFromJson(userJson.type) as ActorType.User,
    id: userJson.id,
    displayName: userJson.display_name,
    email: userJson.email,
    isGlobalAdministrator: userJson.is_global_administrator,
    requirePasswordReset: userJson.require_password_reset,
    isEnabled: userJson.is_enabled,
    appData: userJson.app_data,
  };
}

export function userToJson(user: User): UserJson {
  return {
    type: actorTypeToJson(user.type) as "user",
    id: user.id,
    display_name: user.displayName,
    email: user.email,
    is_global_administrator: user.isGlobalAdministrator,
    require_password_reset: user.requirePasswordReset,
    is_enabled: user.isEnabled,
    app_data: user.appData,
  };
}
