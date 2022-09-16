import computeForm from "../../form/computeFields";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import IReqData from "../../../interfaces/IReqData";
import getReqData from "../getReqData";
import {ICreateAccessCheck} from "../../../interfaces/crud/security/ICreateAccessCheck";
import IFormGetter from "../../../interfaces/form/IFormGetter";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";
import IForm from "../../../interfaces/form/IForm";

export default function post<M extends Model,IData = any>(model: ModelStatic<M>, formGetter: IFormGetter<M,IData>, createAccessCheck: null|ICreateAccessCheck = null, params: ICrudParams&IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const reqData: IReqData = getReqData(req);
        if (createAccessCheck && !(await createAccessCheck(reqData)))
            return res.sendStatus(params.forbiddenCode??403);

        const form: IForm<M,  IData> = formGetter(reqData,req.method.toLowerCase(), null);
        const {computedData, validatedData, violations} = await computeForm<M,IData>(req.body, form);
        if (violations)
            return res.status(422).json({violations});

        model.create(computedData)
            .then(async (elem) => {
                if (params.finished)
                    await params.finished(reqData, elem);
                if (form.onCreated)
                    await form.onCreated(elem,validatedData)

                res.status(201).json(elem);
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