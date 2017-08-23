import {DataNodeId} from "../scalars/data-node-id";
import {Json} from "../scalars/json";

export interface DataNodeBase {
  id: DataNodeId;
  displayName: string;
  appData: Json;
  // TODO
}

export interface DataNodeBaseJson {
  id: DataNodeId;
  display_name: string;
  app_data: Json;
  // TODO
}
