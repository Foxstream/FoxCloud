import {DisplayName} from "../scalars/display-name";
import {EmailAddress} from "../scalars/email-address";
import {Json} from "../scalars/json";
import {UserId} from "../scalars/user-id";
import {DataNodeJson} from "../unions/data-node";

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
  app_data: Json;
  data_nodes: DataNodeJson[];
}
