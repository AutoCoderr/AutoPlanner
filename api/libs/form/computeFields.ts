import IForm from "../../interfaces/form/IForm";
import checkModels from "./checkModels";
import validate from "./validate";
import getFields from "./getFields";
import IComputedForm from "../../interfaces/form/IComputedForm";

export default async function computeFields(data: {[key: string]: any}, form: IForm, withNotStoredFields = false): IComputedForm {
    const computedData = await checkModels(data, form.fields)

    const validateRes = await validate(computedData, form.fields);
    if (validateRes !== true)
        return {violations: validateRes, computedData: null};

    return {computedData: await getFields(computedData,form, withNotStoredFields), violations: null};
}