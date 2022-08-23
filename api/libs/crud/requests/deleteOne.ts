import computeForm from "../../form/computeFields";
import getReqData from "../getReqData";
import IAccessCheck from "../../../interfaces/crud/security/IAccessCheck";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import isNumber from "../../isNumber";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";

export default function deleteOne(model, accessCheck: IAccessCheck, params: ICrudParams&IGetAndCheckExistingResourceParams = {}) {
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
                    await params.finished(getReqData(req));

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