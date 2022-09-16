import compileDataValues from "../compileDatavalues";
import allModelsTypes from "../../interfaces/allModelsType";
import {Includeable} from "sequelize/types/model";
import {Model} from "sequelize";

type obj = {[key: string]: any};
type objs = object[];

interface IExpectElemParam {
    res: {statusCode: number, text: string};
    toCheck: obj|objs|null|((jsonRes: boolean,body: any) => obj|objs|null);
    code: number;
    checkBody?: boolean;
    checkDbElem?: boolean;
    id?: number;
    getter?: (body: any) => any|Promise<any>;
    model?: allModelsTypes;
    include?: Includeable|Includeable[];
}

function getParamsValues(params: IExpectElemParam) {
    const defaultValues: Pick<IExpectElemParam, 'checkBody'|'checkDbElem'> = {
        checkBody: true,
        checkDbElem: true
    }
    return Object.entries(defaultValues).reduce((acc,[key,defaultValue]) => ({
        ...acc,
        [key]: acc[key]??defaultValue
    }), params)
}

export default async function expectElem(params: IExpectElemParam) {
    const {res, toCheck, code, checkBody, checkDbElem, id, getter, model} = getParamsValues(params);

    expect(res.statusCode).toEqual(code);

    const body = checkBody ? JSON.parse(res.text) : null;

    if (checkBody && body === null)
        throw new Error("Bad body");

    if (body)
        expect(body).toEqual(typeof(toCheck) == "function" ? toCheck(true, body) : toCheck);

    if (!checkDbElem)
        return false;

    if (!getter && !model)
        throw new Error("You need to mention a model");

    if (!id && !getter && (body === null || !body.id))
        throw new Error("You need to mention an id");

    const elem = getter ?
        await getter(body) :
        await (<any>model).findOne({
            where: { id: id??body.id },
            include: params.include
        })

    expect(compileDataValues(elem)).toEqual(typeof(toCheck) == "function" ? toCheck(false, body) : toCheck);

    return elem;
}
