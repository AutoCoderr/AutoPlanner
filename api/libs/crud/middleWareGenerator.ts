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
    params:IGetAndCheckExistingResourceParams<M> = {}
) {
    return async function (req, res, next) {
        const mode: 'get' | 'update' = req.method === "GET" ? 'get' : 'update';

        const {
            elem,
            code
        } = await getAndCheckExistingResource(model, req, mode, accessCheck, req.user, {
            ...params,
            idParamName: resource_name + "_id"
        });

        if (!elem)
            return res.sendStatus(code);

        req[resource_name] = elem;
        next();
    };
}