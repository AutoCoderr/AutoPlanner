import middleWareGenerator from "../libs/crud/middleWareGenerator";
import Folder from "../models/Folder";
import folderAccessCheck from "../security/accessChecks/folderAccessCheck";

export default () => middleWareGenerator(Folder, folderAccessCheck, "folder");