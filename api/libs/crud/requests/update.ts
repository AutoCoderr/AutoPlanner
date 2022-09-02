import {IAccessCheck} from "../../../interfaces/crud/security/IAccessCheck";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import isNumber from "../../isNumber";
import IForm from "../../../interfaces/form/IForm";
import computeForm from "../../form/computeFields";
import getReqData from "../getReqData";
import IFormGetter from "../../../interfaces/form/IFormGetter";
import IUpdateParams from "../../../interfaces/crud/IUpdateParams";

export default function update(model, formGetter: IFormGetter, accessCheck: IAccessCheck, params: IUpdateParams&IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await getAndCheckExistingResource(model, parseInt(id), "update", accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        const reqData = getReqData(req);

        const form_0 = formGetter(reqData, req.method.toLowerCase(), elem);
        const form: IForm = params.fieldExtractor ? params.fieldExtractor(form_0) : form_0;
        const {computedData, violations} = await computeForm(req.body, form, elem, params.checkAllFieldsUnique??false);
        if (violations)
            return res.status(422).json({violations});

        for (const [key,value] of Object.entries(computedData)) {
            elem[key] = value;
        }

        elem.save()
            .then(async () => {
                if (params.finished)
                    await params.finished(reqData, elem);

                res.status(200).json(elem);
            })
            .catch(e => {
                console.error(e);
                res.sendStatus(
                    typeof (params.errorCode) === "number" ?
                        params.errorCode :
                        typeof (params.errorCode) === "function" ?
                            params.errorCode(e) :
                            500
                )
            });
    }
}