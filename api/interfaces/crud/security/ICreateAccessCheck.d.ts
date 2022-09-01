import IReqData from "../../IReqData";

export type ICreateAccessCheck = (
    reqData: IReqData
) => boolean|Promise<boolean>

export type IFCreateAccessCheck = ((params: any) => ICreateAccessCheck)