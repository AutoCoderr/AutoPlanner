import Todo from "../models/Todo";
import Folder from "../models/Folder";
import {TodoWithParent} from "../interfaces/models/Todo";
import IReqData from "../interfaces/form/IReqData";

export function findOneTodoByIdWithParent(id: number): Promise<null|TodoWithParent> {
    return <Promise<null|TodoWithParent>>Todo.findOne({
        where: { id },
        include: {
            model: Folder,
            as: "parent"
        }
    })
}

export function findTodos(reqData: IReqData): Promise<Todo[]>|Todo[] {
    return reqData.user ? <Promise<Todo[]>>Todo.findAll({
        where: {
            user_id: reqData.user.id
        }
    }) : []
}