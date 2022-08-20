import IReqData from "../IReqData";
import IForm from "./IForm";

type IFormGetter = (reqData: IReqData, method: 'post'|'patch'|'put', elem: any) => IForm;

export default IFormGetter;