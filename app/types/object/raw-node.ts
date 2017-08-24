import {DataNodeBase, DataNodeBaseJson} from "../interfaces/data-node-base";
import {DataNodeType, dataNodeTypeFromJson, dataNodeTypeToJson} from "../enums/data-node-type";

export interface RawNode extends DataNodeBase {
  // TODO
}

export interface RawNodeJson extends DataNodeBaseJson {
  // TODO
}

export function rawNodeFromJson(rawNodeJson: RawNodeJson): RawNode {
  return {
    type: dataNodeTypeFromJson(rawNodeJson.type) as DataNodeType.RawNode,
    id: rawNodeJson.id,
    displayName: rawNodeJson.display_name,
    appData: rawNodeJson.app_data,
  };
}

export function rawNodeToJson(rawNode: RawNode): RawNodeJson {
  return {
    type: dataNodeTypeToJson(rawNode.type) as "raw-node",
    id: rawNode.id,
    display_name: rawNode.displayName,
    app_data: rawNode.appData,
  };
}
