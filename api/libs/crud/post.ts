import IForm from "../../interfaces/form/IForm";
import computeForm from "../form/computeForm";
import ICrudParams from "../../interfaces/crud/ICrudParams";
import IReqData from "../../interfaces/form/IReqData";
import getReqData from "./getReqData";

export default function post(form: IForm, model, params: ICrudParams = {}) {
    return async function (req,res) {
        const reqData: IReqData = getReqData(req);
        const {success, computedData, violations} = await computeForm(req.body, form, reqData);
        if (!success)
            return res.status(422).json({violations});

        model.create(computedData)
            .then(async (elem) => {
                if (params.finished)
                    await params.finished(elem);
                res.sendStatus(201)
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