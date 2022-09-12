import {Op} from "sequelize"

type OpTypes = typeof Op;

type colTypes = OpTypes["eq"]|
    OpTypes["ne"]|
    OpTypes["like"]|
    OpTypes["iLike"]|
    OpTypes["notLike"]|
    OpTypes["notILike"]|
    OpTypes["lt"]|
    OpTypes["lte"]|
    OpTypes["gt"]|
    OpTypes["gte"]|
    OpTypes["in"]|
    OpTypes["notIn"]|
    OpTypes['between']|
    OpTypes['notBetween']

interface IQuerySearchParams {
    [col: string]: colTypes | {
        opType: colTypes,
        cols?: string|string[],
        liaisonCols?: OpTypes["and"]|OpTypes["or"],
        liaisonValues?: OpTypes["and"]|OpTypes["or"],
        multipleValues?: boolean,
        computeValue?: (value: string) => string|boolean|number|Date|null|undefined|Array<string|boolean|number|Date|null|undefined>,
    }
}

export default IQuerySearchParams