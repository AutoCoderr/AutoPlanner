import IField from "../../interfaces/form/IField";
import IViolation from "../../interfaces/form/IViolations";
import IForm from "../../interfaces/form/IForm";
import {Op} from "sequelize";
import compileDataValues from "../compileDatavalues";

async function findOtherValidateErrorMsg(data: {[key: string]: any}, field: string, otherValidate: IField["otherValidates"]) {
    if (!otherValidate || otherValidate.length === 0)
        return null;

    const {msg,valid} = otherValidate[0];

    if (!(await valid(data[field],data)))
        return msg;

    return findOtherValidateErrorMsg(data, field, otherValidate.slice(1));
}

export default async function validate(
    data: {[key: string]: any},
    form: IForm,
    elem: any,
    checkAllFieldsUnique: boolean,
    fields: null|[string,IField][] = null,
    violations: IViolation[] = []
): Promise<IViolation[]> {
    const fieldsArray: [string,IField][] = fields instanceof Array ? fields : Object.entries(form.fields);
    const validatedData = elem ?
        elem.dataValues ?
            compileDataValues(elem) :
            elem :
        {}

    if (fieldsArray.length === 0)
        return violations;

    const [field, {msg, required, valid, otherValidates, model, allowNull, unique, uniqueMsg}] = fieldsArray[0];

    const computedRequired = (required??true);
    if (data[field] === undefined && computedRequired)
        return validate(
            data,
            form,
            validatedData,
            checkAllFieldsUnique,
            fieldsArray.slice(1),
            [
                ...violations,
                {
                    propertyPath: field,
                    message: "Champs '"+field+"' non spécifié",
                }
            ]
        )

    const computedAllowNull = allowNull ?? !computedRequired;

    if (data[field] !== undefined && model && !(data[field] instanceof model) && (!computedAllowNull || data[field] !== null))
        return validate(
            data,
            form,
            validatedData,
            checkAllFieldsUnique,
            fieldsArray.slice(1),
            [
                ...violations,
                {
                    propertyPath: field,
                    message: "Données irrécupérables"
                }
            ]
        )

    if (
        data[field] !== undefined &&
        (
            !computedAllowNull ||
            data[field] !== null
        )
    ) {
        const validateErrorMessage: string|null = (valid && !(await valid(data[field],data))) ?
            typeof (msg) === "string" ? msg : msg(data) :
            (await findOtherValidateErrorMsg(data, field, otherValidates))

        if (validateErrorMessage !== null)
            return validate(
                data,
                form,
                validatedData,
                checkAllFieldsUnique,
                fieldsArray.slice(1),
                [
                    ...violations,
                    {
                        propertyPath: field,
                        message: validateErrorMessage
                    }
                ]
            )
    }

    if (
        (data[field] !== undefined || checkAllFieldsUnique) &&
        unique && //@ts-ignore
        (await form.model.findOne({
            where: {
                [field]: data[field] !== undefined ? data[field] : elem[field],
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
            validatedData,
            checkAllFieldsUnique,
            fieldsArray.slice(1),
            [
                ...violations,
                {
                    propertyPath: field,
                    message: typeof(uniqueMsg) === "string" ?
                        uniqueMsg :
                        typeof(uniqueMsg) === "function" ?
                            uniqueMsg(data) :
                            "Ce champs est unique"
                }
            ]
        )

    return validate(
        data,
        form,
        {
            ...validatedData,
            [field]: data[field]
        },
        checkAllFieldsUnique,
        fieldsArray.slice(1),
        violations
    )
}