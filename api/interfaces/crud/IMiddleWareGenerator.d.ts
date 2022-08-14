import allModelsTypes from "../allModelsType";
import IAccessCheck from "./security/IAccessCheck";
import IGetAndCheckExistingResourceParams from "./IGetAndCheckExistingResourceParams";
import IReqData from "../form/IReqData";

type IMiddleWareGenerator = (
    model: allModelsTypes,
    accessCheck: IAccessCheck,
    resource_name: Exclude<keyof IReqData,'user'>,
    params: IGetAndCheckExistingResourceParams = {}
) =>
    (req: any, res: any, next: any) => void|Promise<void>

export default IMiddleWareGenerator;