import Todo from "../models/Todo";
import Folder from "../models/Folder";
import compileDataValues from "../libs/compileDatavalues";
import {ITodoWithParent} from "../interfaces/Todo";

export function findOneTodoByIdWithParent(id: number): Promise<null|ITodoWithParent> {
    return <Promise<null|ITodoWithParent>>Todo.findOne({
        where: { id },
        include: {
            model: Folder,
            as: "parent"
        }
    }).then(res => compileDataValues(res));
}