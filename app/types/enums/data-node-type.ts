export enum DataNodeType {
  CompoundNode,
  RawNode,
}

/**
 * JSON-safe representation of [[DataNodeType]].
 */
export type DataNodeTypeJson =
  "compound-node"
  | "raw-node";

export function dataNodeTypeFromJson(dataNodeTypeJson: DataNodeTypeJson): DataNodeType {
  switch (dataNodeTypeJson) {
    case "compound-node":
      return DataNodeType.CompoundNode;
    case "raw-node":
      return DataNodeType.RawNode;
    default:
      throw new Error("UnreachableVariant: Unexpected value for `dataNodeTypeJson`: "
        + dataNodeTypeJson + "(" + DataNodeType[dataNodeTypeJson as any] + ")");
  }
}

export function dataNodeTypeToJson(dataNodeType: DataNodeType): DataNodeTypeJson {
  switch (dataNodeType) {
    case DataNodeType.CompoundNode:
      return "compound-node";
    case DataNodeType.RawNode:
      return "raw-node";
    default:
      throw new Error("UnreachableVariant: Unexpected value for `dataNodeType`: "
        + dataNodeType + "(" + DataNodeType[dataNodeType as any] + ")");
  }
}
