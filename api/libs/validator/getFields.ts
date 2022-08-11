import IForm from "../../interfaces/validator/IForm";
import {IUserConnected} from "../../interfaces/models/User";

export default async function getFields(data: {[key: string]: any}, form: IForm, connectedUser: IUserConnected|undefined, withNotStoredFields = false) {
    return {
        ...(
            await Promise.all(
                Object.entries(data)
                    .filter(([key]) => withNotStoredFields || (form.fields[key].inDB??true))
                    .map(async ([key,value]) => [
                        key,
                        (await form.fields[key].format?.(value)) ?? value
                    ])
            ).then(arrayedData => arrayedData.reduce((acc,[key,value]) => ({
                ...acc,
                [key]: value
            }), {}))
        ),
        ...(
            form.additionalFields ?
                await Promise.all(
                    Object.entries(form.additionalFields).map(async ([key,f]) => [
                        key,
                        await f(data,connectedUser)
                    ])
                ).then(arrayedData => arrayedData.reduce((acc,[key,value]) => ({
                    ...acc,
                    [key]: value
                }), {})) :
                {}
        )
    }
}