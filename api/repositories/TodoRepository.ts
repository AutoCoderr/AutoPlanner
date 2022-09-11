import Todo from "../models/Todo";
import Folder from "../models/Folder";
import {TodoWithParent} from "../interfaces/models/Todo";
import IReqData from "../interfaces/IReqData";
import {Op} from "sequelize";
import getQuerySearch from "../libs/getQuerySearch";
import getQuerySort from "../libs/getQuerySort";

export function findOneTodoByIdWithParent(id: number): Promise<null|TodoWithParent> {
    return <Promise<null|TodoWithParent>>Todo.findOne({
        where: { id },
        include: {
            model: Folder,
            as: "parent"
        }
    })
}

function getTodoQuerySearch(reqData: IReqData) {
    return getQuerySearch(reqData.query, {
        search: {
            liaisonCols: Op.or,
            opType: Op.iLike,
            cols: ['name','description']
        },
        percent: {
            opType: Op.between,
            cols: "percent",
            computeValue: value => value.split(",").map(v => parseInt(v.trim()))
        },
        priority: Op.eq,
        deadLine: {
            opType: Op.between,
            computeValue: value => value.split(",")
                .map(date => new Date(date.trim()))
        }
    })
}

function getTodoQuerySort(reqData: IReqData) {
    return getQuerySort(reqData.query, {
        asc: ['name','percent','priority','deadLine']
    })
}

export function findTodos(reqData: IReqData): Promise<Todo[]>|Todo[] {
    return reqData.user ? <Promise<Todo[]>>Todo.findAll({
        where: {
            user_id: reqData.user.id,
            parent_id: reqData.folder ? reqData.folder.id : {[Op.is]: null},
            ...getTodoQuerySearch(reqData)
        },
        order: getTodoQuerySort(reqData)
    }) : []
}