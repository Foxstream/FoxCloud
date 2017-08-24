import {LegacySite} from "./legacy-site";
import {DataNodeId} from "../../types/scalars/data-node-id";
import {JsonValue} from "../../types/scalars/json-value";
import {SiteInfo} from "./site-info";

/**
 * Represents a site that the current user can view.
 */
export interface LegacyVisibleSite  {
  _id: DataNodeId;
  items: any[];
  siteInfo: JsonValue & SiteInfo;
  isadmin: boolean;
}
