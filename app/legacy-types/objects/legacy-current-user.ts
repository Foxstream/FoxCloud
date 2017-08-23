import {LegacyUser} from "./legacy-user";
import {LegacyVisibleSite} from "./legacy-visible-site";

export interface LegacyCurrentUser {
  user: LegacyUser;
  sites: LegacyVisibleSite[];
}
