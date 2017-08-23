import {SelfGuestJson} from "../object/self-guest";
import {SelfUserJson} from "../object/self-user";

/**
 * JSON-safe result when retrieving information about the current user.
 */
export type SelfJson = SelfGuestJson | SelfUserJson;
