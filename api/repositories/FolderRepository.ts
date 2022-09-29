import Folder from "../models/Folder";
import Todo from "../models/Todo";
import {FolderWithFolders, FolderWithParent, FolderWithTodos} from "../interfaces/models/Folder";
import IReqData from "../interfaces/IReqData";
import {Op} from "sequelize";
import {getTodoQuerySearch, getTodoQuerySort} from "./TodoRepository";
import RelationStepFolder from "../models/RelationStepFolder";

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

export function findFoldersByParentId(parent_id: number): Promise<Folder[]> {
    return Folder.findAll({
        where: {
            parent_id
        }
    })
}

export function findAssociatedFoldersByStep(reqData: IReqData): Promise<Folder[]> | Folder[] {
    return reqData.step !== undefined ? RelationStepFolder.findAll({
        where: {
            step_id: reqData.step.id
        }
    })
        .then(relations => relations.map(({folder_id}) => folder_id))
        .then(folderIds =>
            Folder.findAll({
                where: {
                    id: {[Op.in]: folderIds},
                    ...getFolderQuerySearch(reqData)
                },
                order: getFolderQuerySort(reqData)
            })
        ): []
}

function getFolderQuerySearch(reqData: IReqData) {
    return getTodoQuerySearch(reqData)
}

function getFolderQuerySort(reqData: IReqData) {
    return getTodoQuerySort(reqData)
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