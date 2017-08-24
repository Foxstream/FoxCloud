import {DataNodeType} from "../enums/data-node-type";
import {CompoundNode, compoundNodeFromJson, CompoundNodeJson, compoundNodeToJson} from "../object/compound-node";
import {RawNode, rawNodeFromJson, RawNodeJson, rawNodeToJson} from "../object/raw-node";

export type DataNode = CompoundNode | RawNode;
export type DataNodeJson = CompoundNodeJson | RawNodeJson;

export function dataNodeFromJson(dataNodeJson: DataNodeJson): DataNode {
  switch (dataNodeJson.type) {
    case "compound-node":
      return compoundNodeFromJson(dataNodeJson);
    case "raw-node":
      return rawNodeFromJson(dataNodeJson);
    default:
      throw new Error("UnreachableVariant: Unexpected value for `selfJson.type`: "
        + (dataNodeJson as any).type + "(" + DataNodeType[(dataNodeJson as any).type] + ")");
  }
}

export function dataNodeToJson(dataNode: DataNode): DataNodeJson {
  switch (dataNode.type) {
    case DataNodeType.CompoundNode:
      return compoundNodeToJson(dataNode);
    case DataNodeType.RawNode:
      return rawNodeToJson(dataNode);
    default:
      throw new Error("UnreachableVariant: Unexpected value for `self.type`: "
        + (dataNode as any).type + "(" + DataNodeType[(dataNode as any).type] + ")");
  }
}
