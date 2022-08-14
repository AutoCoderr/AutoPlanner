import isNumber from "../isNumber";
import getAndCheckExistingResource from "./getAndCheckExistingResource";
import IMiddleWareGenerator from "../../interfaces/crud/IMiddleWareGenerator";


const middleWareGenerator: IMiddleWareGenerator =
    (model, accessCheck, resource_name, params = {} ) =>
        async (req,res,next) => {
            const id = req.params[resource_name+"_id"];

            if (!isNumber(id))
                return res.sendStatus(400);

            const mode: 'get'|'update' = req.method === "GET" ? 'get' : 'update';

            const {elem, code} = await getAndCheckExistingResource(model, parseInt(id), mode, accessCheck, req.user, params);

            if (!elem)
                return res.sendStatus(code);

            req[resource_name] = elem;
            next();
        };

export default middleWareGenerator;