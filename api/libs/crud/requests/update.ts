import IAccessCheck from "../../../interfaces/crud/security/IAccessCheck";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import isNumber from "../../isNumber";
import IForm from "../../../interfaces/form/IForm";
import computeForm from "../../form/computeFields";
import getReqData from "../getReqData";
import IFormGetter from "../../../interfaces/form/IFormGetter";

export default function update(model, formGetter: IFormGetter, fieldExtractor: ((form: IForm) => IForm)|null, accessCheck: IAccessCheck, params: ICrudParams&IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await getAndCheckExistingResource(model, parseInt(id), "update", accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        const reqData = getReqData(req);

        const form = fieldExtractor ? fieldExtractor(formGetter(reqData)) : {...formGetter(reqData), additionalFields: undefined};
        const {computedData, violations} = await computeForm(req.body, form);
        if (violations)
            return res.status(422).json({violations});

        for (const [key,value] of Object.entries(computedData)) {
            elem[key] = value;
        }

        elem.save()
            .then(async () => {
                if (params.finished)
                    await params.finished(elem);

                res.sendStatus(200)
            })
            .catch(e =>
                res.sendStatus(
                    typeof(params.errorCode) === "number" ?
                        params.errorCode :
                        typeof(params.errorCode) === "function" ?
                            params.errorCode(e) :
                            500
                )
            )
    }
}