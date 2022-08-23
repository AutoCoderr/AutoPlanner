import IField from "../../interfaces/form/IField";
import isNumber from "../isNumber";

export default async function checkModels(
    data: {[key: string]: any},
    fields: {[key: string]: IField }|[string,IField][],
    computedData: {[key: string]: any} = {}): Promise<{[key: string]: any}>
{

        const fieldsArray = fields instanceof Array ? fields : Object.entries(fields);
        if (fieldsArray.length === 0)
            return computedData
        const [key,field] = fieldsArray[0];

        if (data[key] === undefined)
            return checkModels(
                data,
                fieldsArray.slice(1),
                computedData
            )

        const value = (field.model && isNumber(data[key])) ? //@ts-ignore
                await field.model.findOne({
                    where: {id: parseInt(data[key])},
                    include: field.include
                }).then(res => res??data[key]) : data[key]


        return checkModels(
            data,
            fieldsArray.slice(1),
            {
                ...computedData,
                [key]: value
            }
        )
}