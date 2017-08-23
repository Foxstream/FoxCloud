import {DataNodeId} from "../../types/scalars/data-node-id";
import {DisplayName} from "../../types/scalars/display-name";
import {EmailAddress} from "../../types/scalars/email-address";
import {LegacyItem} from "./legacy-item";

// {
//   "_id": "568e2a6928054e901522106b",
//     "name": "vaulx-en-velin",
//     "usersadmin": [
//     "admin@foxstream.fr",
//     "vaulx@admin"
//   ],
//     "users": [],
//     "items": [
//     {
//       "_id": "568e2ba728054e901522106c",
//       "mac": null,
//       "name": "Entree 1",
//       "pairId": "e3ba1968-30c9-4702-b1bb-29cb959b8be5",
//       "lastUpdateTime": "2017-05-18T12:52:06.142Z",
//       "itemid": "vaulxMAC"
//     }
//   ]
// }
export interface LegacySite {
  _id: DataNodeId;
  name: DisplayName;
  usersadmin: EmailAddress[];
  users: EmailAddress[];
  items: LegacyItem[];
}
