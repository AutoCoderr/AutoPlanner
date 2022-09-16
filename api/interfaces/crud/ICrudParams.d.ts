import IReqData from "../IReqData";
import {Model} from "sequelize";

interface ICrudParams<M extends Model> {
    errorCode?: number | ((e) => number),
    finished?: (reqData: IReqData, element: M) => Promise<any>|any
}

export default ICrudParams;