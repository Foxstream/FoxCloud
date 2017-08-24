import {ActorType, actorTypeFromJson, actorTypeToJson} from "../enums/actor-type";

/**
 * Represents the current user when he is not authenticated.
 */
export interface Guest {
  type: ActorType.Guest;
}

/**
 * JSON-safe result when retrieving information about the current user while not authenticated.
 */
export interface GuestJson {
  type: "guest";
}

export function guestFromJson(guestJson: GuestJson): Guest {
  return {
    type: actorTypeFromJson(guestJson.type) as ActorType.Guest,
  };
}

export function guestToJson(guest: Guest): GuestJson {
  return {
    type: actorTypeToJson(guest.type) as "guest",
  };
}
