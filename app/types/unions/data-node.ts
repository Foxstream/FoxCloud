import {CompoundNode, CompoundNodeJson} from "../object/compound-node";
import {RawNode, RawNodeJson} from "../object/raw-node";

export type DataNode = CompoundNode | RawNode;
export type DataNodeJson = CompoundNodeJson | RawNodeJson;
