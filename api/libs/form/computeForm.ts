import IForm from "../../interfaces/form/IForm";
import checkModels from "./checkModels";
import validate from "./validate";
import getFields from "./getFields";
import IComputedForm from "../../interfaces/form/IComputedForm";
import IReqData from "../../interfaces/form/IReqData";

export default async function computeForm(data: {[key: string]: any}, form: IForm, reqData: IReqData, withNotStoredFields = false): IComputedForm {
    const computedData = await checkModels(data, form.fields)

    const validateRes = await validate(computedData, form.fields, reqData);
    if (validateRes !== true)
        return {success: false, violations: validateRes, computedData: null};

    return {success: true, computedData: await getFields(computedData,form, reqData, withNotStoredFields), violations: null};
}