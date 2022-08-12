import IForm from "../../interfaces/validator/IForm";
import checkModels from "./checkModels";
import validate from "./validate";
import getFields from "./getFields";
import IComputedForm from "../../interfaces/validator/IComputedForm";
import {IUserConnected} from "../../interfaces/models/User";

export default async function computeForm(data: {[key: string]: any}, form: IForm, connectedUser: undefined|IUserConnected = undefined, withNotStoredFields = false): IComputedForm {
    const computedData = await checkModels(data, form.fields)

    const validateRes = await validate(computedData, form.fields, connectedUser);
    if (validateRes !== true)
        return {success: false, violations: validateRes, computedData: null};

    return {success: true, computedData: await getFields(computedData,form, connectedUser, withNotStoredFields), violations: null};
}