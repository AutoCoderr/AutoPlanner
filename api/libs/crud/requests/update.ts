import {IAccessCheck} from "../../../interfaces/crud/security/IAccessCheck";
import getAndCheckExistingResource from "../getAndCheckExistingResource";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import isNumber from "../../isNumber";
import computeForm from "../../form/computeFields";
import getReqData from "../getReqData";
import IFormGetter from "../../../interfaces/form/IFormGetter";
import IUpdateParams from "../../../interfaces/crud/IUpdateParams";
import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";
import IForm from "../../../interfaces/form/IForm";

export default function update<M extends Model, IData = any>(model: ModelStatic<M>, formGetter: IFormGetter<M,IData>, accessCheck: IAccessCheck, params: IUpdateParams<M>&IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await getAndCheckExistingResource(model, parseInt(id), "update", accessCheck, req.user, params);

        if (!elem)
            return res.sendStatus(code);

        const reqData = getReqData(req);

        const form_0: IForm<M, IData> = formGetter(reqData, req.method.toLowerCase(), elem);
        const form: IForm<M, IData> = params.fieldExtractor ? params.fieldExtractor(form_0) : form_0;
        const {computedData, validatedData, violations} = await computeForm<M,IData>(req.body, form, elem,params.checkAllFieldsUnique??false);
        if (violations)
            return res.status(422).json({violations});

        for (const [key,value] of Object.entries(computedData)) {
            elem[key] = value;
        }

        elem.save()
            .then(async () => {
                if (params.finished)
                    await params.finished(reqData, elem);
                if (form.onUpdated)
                    await form.onUpdated(elem, <IData>validatedData);

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