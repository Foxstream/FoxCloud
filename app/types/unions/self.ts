import {ActorType} from "../enums/actor-type";
import {Guest, guestFromJson, GuestJson, guestToJson} from "../object/guest";
import {SelfUser, selfUserFromJson, SelfUserJson, selfUserToJson} from "../object/self-user";

export type Self = Guest | SelfUser;

/**
 * JSON-safe result when retrieving information about the current user.
 */
export type SelfJson = GuestJson | SelfUserJson;

export function selfFromJson(selfJson: SelfJson): Self {
  switch (selfJson.type) {
    case "guest":
      return guestFromJson(selfJson);
    case "user":
      return selfUserFromJson(selfJson);
    default:
      throw new Error("UnreachableVariant: Unexpected value for `selfJson.type`: "
        + (selfJson as any).type + "(" + ActorType[(selfJson as any).type] + ")");
  }
}

export function selfToJson(self: Self): SelfJson {
  switch (self.type) {
    case ActorType.Guest:
      return guestToJson(self);
    case ActorType.User:
      return selfUserToJson(self);
    default:
      throw new Error("UnreachableVariant: Unexpected value for `self.type`: "
        + (self as any).type + "(" + ActorType[(self as any).type] + ")");
  }
}
