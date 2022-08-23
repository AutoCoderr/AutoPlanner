import computeForm from "../../form/computeFields";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import IReqData from "../../../interfaces/IReqData";
import getReqData from "../getReqData";
import ICreateAccessCheck from "../../../interfaces/crud/security/ICreateAccessCheck";
import IFormGetter from "../../../interfaces/form/IFormGetter";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";

export default function post(model, formGetter: IFormGetter, createAccessCheck: null|ICreateAccessCheck = null, params: ICrudParams&IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const reqData: IReqData = getReqData(req);
        if (createAccessCheck && !(await createAccessCheck(reqData)))
            return res.sendStatus(params.forbiddenCode??403);

        const {computedData, violations} = await computeForm(req.body, formGetter(reqData,req.method.toLowerCase(), null));
        if (violations)
            return res.status(422).json({violations});

        model.create(computedData)
            .then(async (elem) => {
                if (params.finished)
                    await params.finished(reqData, elem);
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