import IReqData from "../form/IReqData";

type IAllGetter = (reqData: IReqData) => any[]|Promise<any[]>

export default IAllGetter;