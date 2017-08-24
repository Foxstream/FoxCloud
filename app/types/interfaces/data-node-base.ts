import {DataNodeType, DataNodeTypeJson} from "../enums/data-node-type";
import {DataNodeId} from "../scalars/data-node-id";
import {JsonValue} from "../scalars/json-value";

export interface DataNodeBase {
  type: DataNodeType;
  id: DataNodeId;
  displayName: string;
  appData: JsonValue;
  // TODO
}

export interface DataNodeBaseJson {
  type: DataNodeTypeJson;
  id: DataNodeId;
  display_name: string;
  app_data: JsonValue;
  // TODO
}
