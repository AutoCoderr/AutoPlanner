import ICreateAccessCheck from "../../interfaces/crud/security/ICreateAccessCheck";

const todoCreateAccessCheck: ICreateAccessCheck = (reqData) =>
    reqData.user !== undefined

export default todoCreateAccessCheck;