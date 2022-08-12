import IField from "./IField";
import IReqData from "./IReqData";

interface IForm {
    fields: {
        [key: string]: IField
    },
    additionalFields?: {
        [key: string]: (data: {[key: string]: any}, reqData: IReqData) => Promise<any>|any
    }
}

export default IForm;