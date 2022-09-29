import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";
import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import {IUserConnected} from "../../interfaces/models/User";
import IGetAndCheckExistingResourceParams from "../../interfaces/crud/IGetAndCheckExistingResourceParams";
import isNumber from "../isNumber";

export default async function getAndCheckExistingResource<M extends Model, IM = M>(
    model: ModelStatic<M>,
    req,
    mode: 'get'|'update'|'delete',
    accessCheck: IAccessCheck,
    connectedUser: undefined|IUserConnected = undefined,
    params: IGetAndCheckExistingResourceParams<IM> = {}
) {
    const idParamName = params.idParamName ?? "id";
    const id = req.params[idParamName];
    if (!isNumber(id))
        return {code: 400, elem: null};

    const elem = await <Promise<IM|null>>model.findOne({
        where: <M['_creationAttributes']>{ id: parseInt(id) },
        include: params.include
    })

    if (elem === null)
        return {code: params.notFoundCode??404, elem: null};

    if (!(await accessCheck(elem,mode,connectedUser)))
        return {code: params.forbiddenCode??403, elem: null};

    if (!params.getter)
        return {elem, code: null};

    const getted = await params.getter(elem);

    if (!getted)
        return {code: params.notFoundFromGetterCode??404, elem: null};

    if (params.gettedAccessCheck && !(await params.gettedAccessCheck(getted, mode, connectedUser)))
        return {code: params.forbiddenCode??403, elem: null};

    return {elem: getted, code: null};
}