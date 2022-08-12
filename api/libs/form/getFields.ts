import IForm from "../../interfaces/form/IForm";
import IReqData from "../../interfaces/form/IReqData";

export default async function getFields(data: {[key: string]: any}, form: IForm, reqData: IReqData, withNotStoredFields = false) {
    const formattedData = await Promise.all(
        Object.entries(data)
            .filter(([key]) => withNotStoredFields || (form.fields[key].inDB??true))
            .map(async ([key,value]) => [
                key,
                (await form.fields[key].format?.(value)) ?? value
            ])
    ).then(arrayedData => arrayedData.reduce((acc,[key,value]) => ({
        ...acc,
        [key]: value
    }), {}));

    const additionalData = form.additionalFields ?
        await Promise.all(
            Object.entries(form.additionalFields).map(async ([key,f]) => [
                key,
                await f(formattedData,reqData)
            ])
        ).then(arrayedData => arrayedData.reduce((acc,[key,value]) => ({
            ...acc,
            [key]: value
        }), {})) :
        {};

    return {
        ...formattedData,
        ...additionalData
    }
}