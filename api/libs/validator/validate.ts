import IField from "../../interfaces/validator/IField";
import IViolation from "../../interfaces/validator/IViolations";
import {IUserConnected} from "../../interfaces/models/User";

export default async function validate(data: {[key: string]: any}, fields: {[key: string]: IField }, connectedUser: undefined|IUserConnected = undefined) {
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
            if (data[key] !== undefined && valid && !(await valid(data[key],data,connectedUser)))
                return {
                    propertyPath: key,
                    message: msg
                }

            return null
    })).then(violations => violations.filter(violation => violation !== null));

    return violations.length > 0 ? violations : true;
}