import isNumber from "../isNumber";
import getAndCheckExistingResource from "./getAndCheckExistingResource";
import {ModelStatic} from "sequelize/types/model";
import {Model} from "sequelize";
import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import IReqData from "../../interfaces/IReqData";
import IGetAndCheckExistingResourceParams from "../../interfaces/crud/IGetAndCheckExistingResourceParams";


export default function middleWareGenerator<M extends Model>(
    model: ModelStatic<M>,
    accessCheck: IAccessCheck,
    resource_name: Exclude<keyof IReqData,'user'>,
    params:IGetAndCheckExistingResourceParams = {}
) {
    return async function (req, res, next) {
        const id = req.params[resource_name + "_id"];

        if (!isNumber(id))
            return res.sendStatus(400);

        const mode: 'get' | 'update' = req.method === "GET" ? 'get' : 'update';

        const {
            elem,
            code
        } = await getAndCheckExistingResource(model, parseInt(id), mode, accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        req[resource_name] = elem;
        next();
    };
}