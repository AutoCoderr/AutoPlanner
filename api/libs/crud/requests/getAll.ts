import IGetAllAccessCheck from "../../../interfaces/crud/security/IGetAllAccessCheck";
import IAllGetter from "../../../interfaces/crud/IAllGetter";
import getReqData from "../getReqData";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";

export default function getAll(getAllAccessCheck: IGetAllAccessCheck, allGetter: IAllGetter, params: IGetAndCheckExistingResourceParams = {}) {
    return async function (req,res) {
        const reqData = getReqData(req);

        if (!(await getAllAccessCheck(reqData)))
            return res.sendStatus(params.forbiddenCode??403);

        const data = await allGetter(reqData);
        res.json(data);
    }
}