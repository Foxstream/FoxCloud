import {DisplayName} from "../../types/scalars/display-name";
import {EmailAddress} from "../../types/scalars/email-address";
import {Json} from "../../types/scalars/json";
import {UserId} from "../../types/scalars/user-id";

export interface LegacyUser {
  _id: UserId;
  admin: boolean;
  email: EmailAddress;
  enabled: boolean;
  name: DisplayName;
  userInfo: Json;
}
