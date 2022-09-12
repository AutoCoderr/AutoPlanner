import IReqData from "../IReqData";

type IAllGetter = (reqData: IReqData) => any|Promise<any>

export default IAllGetter;