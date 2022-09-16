import IReqData from "../IReqData";
import IForm from "./IForm";
import {Model} from "sequelize";

type IFormGetter<M extends Model,IData = any> = (reqData: IReqData, method: 'post'|'patch'|'put', elem: M|null) => IForm<M,IData>;

export default IFormGetter;