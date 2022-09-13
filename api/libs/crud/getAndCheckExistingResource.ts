import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";
import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import {IUserConnected} from "../../interfaces/models/User";
import IGetAndCheckExistingResourceParams from "../../interfaces/crud/IGetAndCheckExistingResourceParams";

export default async function getAndCheckExistingResource<M extends Model>(
    model: ModelStatic<M>,
    id: number,
    mode: 'get'|'update'|'delete',
    accessCheck: IAccessCheck,
    connectedUser: undefined|IUserConnected = undefined,
    params: IGetAndCheckExistingResourceParams = {}
) {
    const elem = await model.findOne({
        where: <M['_creationAttributes']>{ id },
        include: params.include
    })

    if (elem === null)
        return {code: params.notFoundCode??404, elem: null};

    if (!(await accessCheck(elem,mode,connectedUser)))
        return {code: params.forbiddenCode??403, elem: null};

    if (!params.getter)
        return {elem, code: null};

    const getted = params.getter(elem);

    if (!getted)
        return {code: params.notFoundCode??404, elem: null};

    if (params.gettedAccessCheck && !(await params.gettedAccessCheck(getted, mode, connectedUser)))
        return {code: params.forbiddenCode??403, elem: null};

    return {elem: getted, code: null};
}