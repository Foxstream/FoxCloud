import {DisplayName} from "../scalars/display-name";
import {EmailAddress} from "../scalars/email-address";
import {Json} from "../scalars/json";
import {UserId} from "../scalars/user-id";
import {DataNodeJson} from "../unions/data-node";

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
  app_data: Json;
}
