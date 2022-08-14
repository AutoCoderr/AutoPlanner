import IReqData from "../../form/IReqData";

type ICreateAccessCheck = (
    reqData: IReqData
) => boolean|Promise<boolean>

export default ICreateAccessCheck;