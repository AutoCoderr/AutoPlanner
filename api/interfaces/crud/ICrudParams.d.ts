import IReqData from "../IReqData";

interface ICrudParams {
    errorCode?: number | ((e) => number),
    finished?: (reqData: IReqData, element: any = undefined) => Promise<any>|any
}

export default ICrudParams;