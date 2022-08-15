import IReqData from "./IReqData";
import IForm from "./IForm";

type IFormGetter = (reqData: IReqData) => IForm;

export default IFormGetter;