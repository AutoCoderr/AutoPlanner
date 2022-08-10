import IField from "../../interfaces/validator/IField";
import IViolation from "../../interfaces/validator/IViolations";

export default function validate(body: {[key: string]: any}, fields: {[key: string]: IField }) {
    const violations: IViolation[] = <IViolation[]>Object.entries(fields).map(([key,{msg, required, valid}]) =>
        (body[key] === undefined && (required??true)) ? {
            propertyPath: key,
            message: "Champs '"+key+"' non spécifié"
        } :
            (body[key] !== undefined && valid && !valid(body[key],body)) ?
                {
                    propertyPath: key,
                    message: msg
                } :
                null
    ).filter(violation => violation !== null)

    return violations.length > 0 ? violations : true;
}