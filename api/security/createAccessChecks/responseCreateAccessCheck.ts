import {ICreateAccessCheck} from "../../interfaces/crud/security/ICreateAccessCheck";

const responseCreateAccessCheck: ICreateAccessCheck = (reqData) =>
    reqData.user !== undefined &&
    reqData.node !== undefined &&
    reqData.node.type === "question"

export default responseCreateAccessCheck;