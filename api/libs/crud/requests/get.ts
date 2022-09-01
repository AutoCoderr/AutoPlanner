import isNumber from "../../isNumber";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import {IAccessCheck} from "../../../interfaces/crud/security/IAccessCheck";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";

export default function get(model, accessCheck: IAccessCheck, params: IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await getAndCheckExistingResource(model, id, "get", accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        res.json(elem);
    }
}