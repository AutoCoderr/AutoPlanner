import IGetAndCheckExistingResource from "../../interfaces/crud/IGetAndCheckExistingResource";

const getAndCheckExistingResource: IGetAndCheckExistingResource = async (
    model,
    id,
    mode,
    accessCheck,
    connectedUser = undefined,
    params = {}
) => {
    //@ts-ignore
    const elem = await  model.findOne({
        where: { id },
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

export default getAndCheckExistingResource;