import {DisplayName} from "../../types/scalars/display-name";
import {EmailAddress} from "../../types/scalars/email-address";
import {JsonValue} from "../../types/scalars/json-value";
import {UserId} from "../../types/scalars/user-id";
import {User} from "../../types/object/user";

export interface LegacyUser {
  _id: UserId;
  admin: boolean;
  email: EmailAddress;
  enabled: boolean;
  name: DisplayName;
  userInfo: JsonValue;
}

export function legacyUserFromUser(user: User): LegacyUser {
  return {
    _id: user.id,
    admin: user.isGlobalAdministrator,
    email: user.email,
    enabled: user.isEnabled,
    name: user.displayName,
    userInfo: user.appData,
  };
}
