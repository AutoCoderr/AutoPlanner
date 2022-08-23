import TodoModel from "../models/TodoModel";
import IReqData from "../interfaces/IReqData";
import {Op, WhereOptions} from "sequelize";
import getQuerySearch from "../libs/getQuerySearch";
import getQuerySort from "../libs/getQuerySort";

function getModelQuerySearch(reqData: IReqData) {
    if (reqData.user === undefined)
        return {};
    return getQuerySearch(reqData.query, {
        search: {
            opType: Op.iLike,
            cols: ['name','description'],
            liaisonCols: Op.or,
            computeValue: value => '%'+value+'%'
        },
        ...(
            (!reqData.all && (reqData.specifiedUser === undefined || reqData.specifiedUser.id === reqData.user.id)) ? {
                published: {
                    opType: Op.eq,
                    computeValue: value => value === 'true'
                }
            } : {}
        )
    })
}

function getModelQuerySort(reqData: IReqData) {
    return getQuerySort(reqData.query, {
        asc: ['updatedAt','name'],
        desc: ['updatedAt','name']
    })
}

export function findModels(reqData: IReqData): Promise<TodoModel[]>|TodoModel[] {
    return reqData.user !== undefined ?
        TodoModel.findAll({
            where: {
                ...getModelQuerySearch(reqData),
                ...(
                    reqData.all ? {
                        published: true
                    } :
                    (reqData.specifiedUser !== undefined && reqData.specifiedUser.id !== reqData.user.id) ?
                        {
                            user_id: reqData.specifiedUser.id,
                            published: true
                        } :
                        {
                            user_id: reqData.user.id
                        }
                )
            },
            order: getModelQuerySort(reqData)
        }) : []
}