import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import Folder from "../../models/Folder";

const folderAccessCheck: IAccessCheck = (folder: Folder, mode, user) =>
    user !== undefined && folder.user_id === user.id;

export default folderAccessCheck;