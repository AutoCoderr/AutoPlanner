import IForm from "../../interfaces/form/IForm";
import checkModels from "./checkModels";
import validate from "./validate";
import getFields from "./getFields";
import IComputedForm from "../../interfaces/form/IComputedForm";

export default async function computeFields(data: {[key: string]: any}, form: IForm, elem: any = null, checkAllFieldsUnique = false ,withNotStoredFields = false): IComputedForm {
    const computedData = await checkModels(data, form.fields)

    const violations = await validate(computedData, form, elem, checkAllFieldsUnique);
    if (violations.length > 0)
        return {violations, computedData: null};

    return {computedData: await getFields(computedData,form, withNotStoredFields), violations: null};
}