import {IUserConnected} from "../../models/User";

type IAccessCheck = (elem, mode: 'get'|'update'|'delete', user: undefined|IUserConnected = undefined) => boolean|Promise<boolean>

export default IAccessCheck;