import Folder from "../models/Folder";
import Todo from "../models/Todo";
import {FolderWithFolders, FolderWithParent, FolderWithTodos} from "../interfaces/models/Folder";
import IReqData from "../interfaces/IReqData";
import {Op} from "sequelize";
import getQuerySearch from "../libs/getQuerySearch";
import getQuerySort from "../libs/getQuerySort";

export function findOneFolderByIdWithFolders(id: number): Promise<null|FolderWithFolders> {
    return <Promise<null|FolderWithFolders>>Folder.findOne({
        where: { id },
        include: {
            model: Folder,
            as: 'folders'
        }
    })
}

export function findOneFolderByIdWithParent(id: number): Promise<null|FolderWithParent> {
    return <Promise<null|FolderWithParent>>Folder.findOne({
        where: { id },
        include: {
            model: Folder,
            as: 'parent'
        }
    })
}

export function findOneFolderByIdWithTodos(id: number): Promise<null|FolderWithTodos> {
    return <Promise<null|FolderWithTodos>>Folder.findOne({
        where: { id },
        include: {
            model: Todo,
            as: 'todos'
        }
    })
}

function getFolderQuerySearch(reqData: IReqData) {
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

function getFolderQuerySort(reqData: IReqData) {
    return getQuerySort(reqData.query, {
        asc: ['name','percent','priority','deadLine']
    })
}

export function findFolders(reqData: IReqData): Promise<Folder[]>|Folder[] {
    return reqData.user ?
        <Promise<Folder[]>>Folder.findAll({
            where: {
                user_id: reqData.user.id,
                parent_id: reqData.folder ? reqData.folder.id : {[Op.is]: null},
                ...getFolderQuerySearch(reqData)
            },
            order: getFolderQuerySort(reqData)
        }) : []
}