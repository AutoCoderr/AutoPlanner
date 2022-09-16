import getReqData from "../getReqData";
import {IAccessCheck} from "../../../interfaces/crud/security/IAccessCheck";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import isNumber from "../../isNumber";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";

export default function deleteOne<M extends Model>(model: ModelStatic<M>, accessCheck: IAccessCheck, params: ICrudParams<M>&IGetAndCheckExistingResourceParams<M> = {}) {
    return async function (req,res) {
        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await getAndCheckExistingResource(model, parseInt(id), "delete", accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        elem.destroy()
            .then(async () => {
                if (params.finished)
                    await params.finished(getReqData(req), elem);

                res.sendStatus(204);
            })
            .catch(e =>
                res.sendStatus(
                    typeof(params.errorCode) === "number" ?
                        params.errorCode :
                        typeof(params.errorCode) === "function" ?
                            params.errorCode(e) :
                            500
                )
            );
    }
}