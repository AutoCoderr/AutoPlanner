import IReqData from "../../IReqData";

type ICreateAccessCheck = (
    reqData: IReqData
) => boolean|Promise<boolean>

export default ICreateAccessCheck;