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
        where: { id }
    })

    if (elem === null)
        return {code: params.notFoundCode??404, elem: null};

    if (!(await accessCheck(elem,mode,connectedUser)))
        return {code: params.forbiddenCode??403, elem: null};

    return {elem, code: null};
}

export default getAndCheckExistingResource;