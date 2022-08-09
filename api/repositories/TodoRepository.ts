import Todo from "../models/Todo";
import Folder from "../models/Folder";
import compileDataValues from "../libs/compileDatavalues";
import {TodoWithParent} from "../interfaces/Todo";

export function findOneTodoByIdWithParent(id: number): Promise<null|TodoWithParent> {
    return <Promise<null|TodoWithParent>>Todo.findOne({
        where: { id },
        include: {
            model: Folder,
            as: "parent"
        }
    }).then(res => compileDataValues(res));
}