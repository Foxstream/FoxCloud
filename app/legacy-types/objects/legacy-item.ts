import {DataNodeId} from "../../types/scalars/data-node-id";
import {DisplayName} from "../../types/scalars/display-name";
import {IsoDate} from "../../types/scalars/iso-date";

// {
//   "_id": "568e2ba728054e901522106c",
//   "mac": null,
//   "name": "Entree 1",
//   "pairId": "e3ba1968-30c9-4702-b1bb-29cb959b8be5",
//   "lastUpdateTime": "2017-05-18T12:52:06.142Z",
//   "itemid": "vaulxMAC"
// }
export interface LegacyItem {
  _id: DataNodeId;
  mac: string | null;
  name: DisplayName;

  /**
   * UUID
   */
  pairId: string;

  /**
   * Date of the last update, `null` if never updated.
   */
  lastUpdateTime: IsoDate | null;

  /**
   * A key identifying this item, `null` if never set.
   */
  itemid: string | null;
}
