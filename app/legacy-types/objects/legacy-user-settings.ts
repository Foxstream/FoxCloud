import {LegacyUser} from "./legacy-user";
import {LegacyVisibleSite} from "./legacy-visible-site";
import {SelfUser} from "../../types/object/self-user";

export interface LegacyUserSettings {
  user: LegacyUser;
  sites: LegacyVisibleSite[];
}

export function legacyUserSettingsFromSelfUser(selfUser: SelfUser): LegacyUserSettings {
  const user: LegacyUser = {
    _id: selfUser.id,
    admin: selfUser.isGlobalAdministrator,
    email: selfUser.email,
    enabled: selfUser.isEnabled,
    name: selfUser.displayName,
    userInfo: selfUser.appData,
  };
  const sites: LegacyVisibleSite[] = [];
  for (const dataNode of selfUser.dataNodes) {
    console.warn("Assuming `isadmin`");
    sites.push({
      _id: dataNode.id,
      isadmin: true,
      items: [],
      siteInfo: dataNode.appData,
    });
  }
  return {user: user, sites: sites};
}
