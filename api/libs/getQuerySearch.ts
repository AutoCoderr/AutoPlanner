import IQuerySearchParams from "../interfaces/IQuerySearchParams";
import {Op, WhereOptions} from "sequelize";

function compareValues(value, liaisonValues, opType, col) {
    return value instanceof Array ? {
        [liaisonValues]: value.map(v => ({
            [col]: { [opType]: v }
        }))
    } : {
        [col]: { [opType]: value }
    }
}

export default function getQuerySearch(query: {[key: string]: string}, querySearchParams: IQuerySearchParams): WhereOptions<any> {
    return Object.entries(querySearchParams).reduce((acc, [key, param]) => {
        if (query[key] === undefined)
            return acc;

        const cols = (typeof (param) === "object" && param.cols) ?
            param.cols :
            key

        const opType = typeof (param) === "object" ? param.opType : param;
        const liaisonCols = (typeof (param) === "object" && param.liaisonCols) ? param.liaisonCols : Op.and;
        const liaisonValues = (typeof (param) === "object" && param.liaisonValues) ? param.liaisonValues : Op.and;

        const value = (typeof (param) === "object" && param.computeValue) ? param.computeValue(query[key]) : query[key]

        return {
            ...acc,
            ...(cols instanceof Array ? {
                        [liaisonCols]: cols.map(col =>
                            compareValues(value, liaisonValues, opType, col)
                        )
                    } :
                    compareValues(value, liaisonValues, opType, cols)
            )
        }
    }, {})
}