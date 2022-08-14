import IGetAllAccessCheck from "../../interfaces/crud/security/IGetAllAccessCheck";

const todoGetAllAccessCheck: IGetAllAccessCheck = (reqData) =>
    reqData.user !== undefined

export default todoGetAllAccessCheck;