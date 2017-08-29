import { SelfUser } from "../../types/object/self-user";
import { LegacyUser } from "./legacy-user";
import { LegacyVisibleSite } from "./legacy-visible-site";

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
  for (const compoundNode of selfUser.viewableCompoundNodes) {
    console.warn("Assuming `isadmin`");
    sites.push({
      _id: compoundNode.id,
      isadmin: true,
      items: [],
      siteInfo: compoundNode.appData,
    });
  }
  return {user: user, sites: sites};
}
