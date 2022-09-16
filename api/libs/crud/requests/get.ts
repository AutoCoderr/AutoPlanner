import isNumber from "../../isNumber";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import {IAccessCheck} from "../../../interfaces/crud/security/IAccessCheck";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";

export default function get<M extends Model, IM = M>(model: ModelStatic<M>, accessCheck: IAccessCheck, params: IGetAndCheckExistingResourceParams<IM> = {}) {
    return async function (req,res) {
        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await getAndCheckExistingResource<M,IM>(model, id, "get", accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        res.json(elem);
    }
}