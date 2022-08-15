import IReqData from "../../form/IReqData";

type IGetAllAccessCheck = (reqData: IReqData) => boolean|Promise<boolean>;

export default IGetAllAccessCheck;