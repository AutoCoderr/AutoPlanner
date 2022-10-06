import Folder from "../../models/Folder";
import {findTodosByParentId} from "../../repositories/TodoRepository";
import {findFoldersByParentId} from "../../repositories/FolderRepository";
import round from "../round";

export default async function calculSynchronizedFolderPercent(folder: Folder): Promise<null|number> {
    if (!folder.percentSynchronized)
        return null;

    const childrenTodos = await findTodosByParentId(folder.id);
    const childrenFolders = await findFoldersByParentId(folder.id);

    return round(
            (
                [...childrenTodos, ...childrenFolders]
                    .reduce((acc,todoOrFolder) => acc+todoOrFolder.percent, 0)  /
                        ((childrenTodos.length + childrenFolders.length) * 100)
                ) * 100
        , 3);
}