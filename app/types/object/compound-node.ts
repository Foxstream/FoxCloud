import {DataNodeBase, DataNodeBaseJson} from "../interfaces/data-node-base";
import {DataNodeType, dataNodeTypeFromJson, dataNodeTypeToJson} from "../enums/data-node-type";

export interface CompoundNode extends DataNodeBase {
  // TODO
}

export interface CompoundNodeJson extends DataNodeBaseJson {
  // TODO
}

export function compoundNodeFromJson(compoundNodeJson: CompoundNodeJson): CompoundNode {
  return {
    type: dataNodeTypeFromJson(compoundNodeJson.type) as DataNodeType.CompoundNode,
    id: compoundNodeJson.id,
    displayName: compoundNodeJson.display_name,
    appData: compoundNodeJson.app_data,
  };
}

export function compoundNodeToJson(compoundNode: CompoundNode): CompoundNodeJson {
  return {
    type: dataNodeTypeToJson(compoundNode.type) as "compound-node",
    id: compoundNode.id,
    display_name: compoundNode.displayName,
    app_data: compoundNode.appData,
  };
}
