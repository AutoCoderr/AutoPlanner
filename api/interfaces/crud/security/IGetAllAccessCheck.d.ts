import IReqData from "../../IReqData";

export type IGetAllAccessCheck = (reqData: IReqData, params?: any) => boolean|Promise<boolean>;

export type IFGetAllAccessCheck = ((params: any) => IGetAllAccessCheck);