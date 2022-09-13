import IForm from "../../interfaces/form/IForm";
import {Model} from "sequelize";

export default async function getFields<M extends Model, IData>(validatedData: IData, form: IForm<M, IData>, withNotStoredFields = false): Promise<M['_creationAttributes']> {
    const computedData = Object.entries(validatedData)
        .filter(([key]) => withNotStoredFields || (form.fields[key].inDB ?? true))
        .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value
        }), {});

    const additionalData = form.additionalFields ?
        await Promise.all(
            Object.entries(form.additionalFields).map(async ([key, f]) => [
                key,
                await f(validatedData)
            ])
        ).then(arrayedData => arrayedData.reduce((acc, [key, value]) => ({
            ...acc,
            [key]: value
        }), {})) :
        {};

    return {
        ...computedData,
        ...additionalData
    }
}