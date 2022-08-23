import IGetAllAccessCheck from "../../interfaces/crud/security/IGetAllAccessCheck";

const responseGetAllAccessCheck: IGetAllAccessCheck = (reqData) =>
    reqData.user !== undefined &&
    reqData.node !== undefined &&
    reqData.node.type === "question"

export default responseGetAllAccessCheck;