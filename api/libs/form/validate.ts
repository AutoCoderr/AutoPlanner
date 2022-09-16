import IField from "../../interfaces/form/IField";
import IViolation from "../../interfaces/form/IViolations";
import IForm from "../../interfaces/form/IForm";
import {Model, Op} from "sequelize";
import compileDataValues from "../compileDatavalues";
import IFields from "../../interfaces/form/IFields";

async function findOtherValidateErrorMsg<IData>(value: any, validatedData: Partial<IData>, field: string, otherValidate: IField<IData>["otherValidates"]) {
    if (!otherValidate || otherValidate.length === 0)
        return null;

    const {msg,valid} = otherValidate[0];

    if (!(await valid(value,validatedData)))
        return msg;

    return findOtherValidateErrorMsg(value, validatedData, field, otherValidate.slice(1));
}

export default async function validate<M extends Model,IData>(
    data: {[key: string]: any},
    form: IForm<M,IData>,
    checkAllFieldsUnique: boolean,
    elem: (M&{id: number}) | null = null,
    fields: null|[string,IField<IData>][] = null,
    violations: IViolation[] = [],
    validatedData: Partial<IData> = {},
): Promise<
    {violations: null, validatedData: IData} |
    {violations: IViolation[], validatedData: null}
    > {
    const fieldsArray: [string,IField<IData>][] = fields instanceof Array ? fields : Object.entries(form.fields);

    if (fieldsArray.length === 0)
        return violations.length > 0 ?
            {violations, validatedData: null} :
            {validatedData: <IData>validatedData, violations: null}

    const [field, {msg, required, valid, otherValidates, model, allowNull, unique, uniqueMsg, format}] = fieldsArray[0];

    const computedRequired = typeof(required) === "function" ?
        required(validatedData) :
        typeof(required) === "boolean" ?
            required :
            true;

    if (data[field] === undefined && computedRequired)
        return validate(
            data,
            form,
            checkAllFieldsUnique,
            elem,
            fieldsArray.slice(1),
            [
                ...violations,
                {
                    propertyPath: field,
                    message: "Champs '"+field+"' non spécifié",
                }
            ],
            validatedData
        )

    const computedAllowNull = allowNull ?? !computedRequired;

    if (data[field] !== undefined && model && !(data[field] instanceof model) && (!computedAllowNull || data[field] !== null))
        return validate(
            data,
            form,
            checkAllFieldsUnique,
            elem,
            fieldsArray.slice(1),
            [
                ...violations,
                {
                    propertyPath: field,
                    message: "Données irrécupérables"
                }
            ],
            validatedData
        )

    if (
        data[field] !== undefined &&
        (
            !computedAllowNull ||
            data[field] !== null
        )
    ) {
        const validateErrorMessage: string|null = (valid && !(await valid(data[field],validatedData))) ?
            typeof (msg) === "string" ? msg : msg(validatedData) :
            (await findOtherValidateErrorMsg<IData>(data[field], validatedData, field, otherValidates))

        if (validateErrorMessage !== null)
            return validate(
                data,
                form,
                checkAllFieldsUnique,
                elem,
                fieldsArray.slice(1),
                [
                    ...violations,
                    {
                        propertyPath: field,
                        message: validateErrorMessage
                    }
                ],
                validatedData
            )
    }

    const newValidatedData: Partial<IData> = {
        ...validatedData,
        ...(
            data[field] !== undefined ? {
                [field]: ((!computedAllowNull || data[field] !== null) && format) ?
                    await format(data[field]) : data[field]
            } : {}
        )
    }

    if (
        (newValidatedData[field] !== undefined || (checkAllFieldsUnique && elem !== null)) &&
        unique &&
        (await form.model.findOne({
            where: <M['_creationAttributes']>{
                [field]: newValidatedData[field] !== undefined ? newValidatedData[field] : (<M>elem)[field],
                ...(elem !== null ? {id: {[Op.ne]: elem.id}} : {}),
                ...(
                    unique === true ?
                        {} :
                        typeof(unique) == "function" ?
                            unique(validatedData).where :
                            unique.where
                )
            }
        })) !== null
    )
        return validate(
            data,
            form,
            checkAllFieldsUnique,
            elem,
            fieldsArray.slice(1),
            [
                ...violations,
                {
                    propertyPath: field,
                    message: typeof(uniqueMsg) === "string" ?
                        uniqueMsg :
                        typeof(uniqueMsg) === "function" ?
                            uniqueMsg(validatedData) :
                            "Ce champs est unique"
                }
            ],
            validatedData
        )

    return validate(
        data,
        form,
        checkAllFieldsUnique,
        elem,
        fieldsArray.slice(1),
        violations,
        newValidatedData
    )
}