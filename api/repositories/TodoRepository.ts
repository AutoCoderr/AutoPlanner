import Todo from "../models/Todo";
import Folder from "../models/Folder";
import {TodoWithFoldersString, TodoWithParent} from "../interfaces/models/Todo";
import IReqData from "../interfaces/IReqData";
import {Op, Order, WhereOptions} from "sequelize";
import getQuerySearch from "../libs/getQuerySearch";
import getQuerySort from "../libs/getQuerySort";
import paginate from "../libs/paginate";
import IPaginatedResult from "../interfaces/crud/IPaginatedResult";
import compileDataValues from "../libs/compileDatavalues";
import {IFolder} from "../interfaces/models/Folder";
import RelationStepTodo from "../models/RelationStepTodo";
import Step from "../models/Step";

export function findOneTodoByIdWithParent(id: number): Promise<null|TodoWithParent> {
    return <Promise<null|TodoWithParent>>Todo.findOne({
        where: { id },
        include: {
            model: Folder,
            as: "parent"
        }
    })
}

export function getTodoQuerySearch(reqData: IReqData) {
    return getQuerySearch(reqData.query, {
        search: {
            liaisonCols: Op.or,
            opType: Op.iLike,
            cols: ['name','description'],
            computeValue: value => '%'+value+'%'
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

export function getTodoQuerySort(reqData: IReqData) {
    return getQuerySort(reqData.query, {
        asc: ['name','percent','priority','deadLine']
    })
}

export function findAssociatedTodosByStep(step: Step, todoQuerySearch: WhereOptions = {}, todoQuerySort: null|Order = null) {
    return RelationStepTodo.findAll({
        where: {
            step_id: step.id
        }
    })
        .then(relations => relations.map(({todo_id}) => todo_id))
        .then(todoIds =>
            Todo.findAll({
                where: {
                    id: {[Op.in]: todoIds},
                    ...todoQuerySearch
                },
                order: todoQuerySort ?? undefined
            })
        )
}

export function findAssociatedTodosByStepWithReqData(reqData: IReqData): Promise<Todo[]> | Todo[] {
    return reqData.step !== undefined ?
        findAssociatedTodosByStep(reqData.step, getTodoQuerySearch(reqData), getTodoQuerySort(reqData)) :
        [];
}

export function findTodosByParentId(parent_id: number): Promise<Todo[]> {
    return Todo.findAll({
        where: {
            parent_id
        }
    })
}

function getRecursivelyTodoFolders(todoOrFolder: Todo|Folder, folders: Pick<IFolder, 'id' | 'name'>[] = []) {
    return todoOrFolder.parent_id === null ?
            folders :
        Folder.findOne({
            where: {
                id: todoOrFolder.parent_id
            }
        }).then(folder =>
            folder === null ?
                folders :
                getRecursivelyTodoFolders(folder, [{id: folder.id, name: folder.name}, ...folders])
        )

}

export function searchTodos(reqData: IReqData): Promise<IPaginatedResult<TodoWithFoldersString>>|IPaginatedResult<TodoWithFoldersString> {
    return reqData.user ?
        <Promise<IPaginatedResult<TodoWithFoldersString>>>paginate(Todo,{
            where: {
                user_id: reqData.user.id,
                ...getTodoQuerySearch(reqData)
            },
            order: getTodoQuerySort(reqData)
        }, reqData.query, 10).then(async ({pages, elements}) => ({
            pages,
            elements: await Promise.all(
                elements.map(async todo => ({
                    ...compileDataValues(todo),
                    folders: await getRecursivelyTodoFolders(todo)
                }))
            )
        })) :
        {pages: 0, elements: []}
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