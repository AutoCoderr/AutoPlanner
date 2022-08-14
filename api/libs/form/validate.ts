import IField from "../../interfaces/form/IField";
import IViolation from "../../interfaces/form/IViolations";

export default async function validate(data: {[key: string]: any}, fields: {[key: string]: IField }) {
        const violations: IViolation[] = await <Promise<IViolation[]>>Promise.all(Object.entries(fields).map(async ([key,{msg, required, valid, model}]) => {
            if (data[key] === undefined && (required??true))
                return {
                    propertyPath: key,
                    message: "Champs '"+key+"' non spécifié",
                };
            if (data[key] === null && model)
                return {
                    propertyPath: key,
                    message: "Données irrécupérables"
                }
            if (data[key] !== undefined && valid && !(await valid(data[key],data)))
                return {
                    propertyPath: key,
                    message: msg
                }

            return null
    })).then(violations => violations.filter(violation => violation !== null));

    return violations.length > 0 ? violations : true;
}