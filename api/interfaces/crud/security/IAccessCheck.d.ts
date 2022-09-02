import {IUserConnected} from "../../models/User";

export type IAccessCheck = (elem, mode: 'get'|'update'|'delete', user: undefined|IUserConnected = undefined, params?: any) => boolean|Promise<boolean>

export type IFAccessCheck = ((params: any) => IAccessCheck);