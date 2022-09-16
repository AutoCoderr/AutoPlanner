import IForm from "../../interfaces/form/IForm";
import checkModels from "./checkModels";
import validate from "./validate";
import getFields from "./getFields";
import IComputedForm from "../../interfaces/form/IComputedForm";
import {Model} from "sequelize";

export default async function computeFields<M extends Model,IData = any>(data: {[key: string]: any}, form: IForm<M, IData>, elem: null|M&{id: number} = null, checkAllFieldsUnique = false ,withNotStoredFields = false): IComputedForm<M,IData> {
    const computedData = await checkModels<IData>(data, form.fields)

    const {validatedData, violations} = await validate<M,IData>(computedData, form, checkAllFieldsUnique, elem);

    if (violations)
        return {violations, computedData: null, validatedData: null};

    return {computedData: await getFields<M,IData>(validatedData,form, withNotStoredFields), validatedData, violations: null};
}