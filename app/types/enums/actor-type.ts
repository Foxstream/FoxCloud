/**
 * Enum representing the possible types of actor.
 */
export enum ActorType {
  Bot,
  DataSource,
  Guest,
  User,
}

/**
 * JSON-safe representation of [[ActorType]].
 */
export type ActorTypeJson =
  "bot"
  | "data-source"
  | "guest"
  | "user";

export function actorTypeFromJson(actorTypeJson: ActorTypeJson): ActorType {
  switch (actorTypeJson) {
    case "bot":
      return ActorType.Bot;
    case "data-source":
      return ActorType.DataSource;
    case "guest":
      return ActorType.Guest;
    case "user":
      return ActorType.User;
    default:
      throw new Error("UnreachableVariant: Unexpected value for `actorTypeJson`: "
        + actorTypeJson + "(" + ActorType[actorTypeJson as any] + ")");
  }
}

export function actorTypeToJson(actorType: ActorType): ActorTypeJson {
  switch (actorType) {
    case ActorType.Bot:
      return "bot";
    case ActorType.DataSource:
      return "data-source";
    case ActorType.Guest:
      return "guest";
    case ActorType.User:
      return "user";
    default:
      throw new Error("UnreachableVariant: Unexpected value for `actorType`: "
        + actorType + "(" + ActorType[actorType as any] + ")");
  }
}
