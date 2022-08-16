import IReqData from "../../IReqData";

type IGetAllAccessCheck = (reqData: IReqData) => boolean|Promise<boolean>;

export default IGetAllAccessCheck;