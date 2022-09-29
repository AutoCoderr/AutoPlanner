import Folder from "../models/Folder";
import Todo from "../models/Todo";
import {findTodosByParentId} from "../repositories/TodoRepository";
import {findFoldersByParentId} from "../repositories/FolderRepository";

export default async function folderChildrenSome(folder: Folder, callback: (todoOrFolder: Todo|Folder) => boolean, toCheck: 'todo'|'folder'|'both' = 'both') {
    const todos = await findTodosByParentId(folder.id);
    if (toCheck !== 'folder' && todos.some(callback))
        return true;

    const folders = await findFoldersByParentId(folder.id);
    for (const folder of folders)
        if (
            (
                toCheck !== 'todo' &&
                callback(folder)
            ) ||
            await folderChildrenSome(folder,callback)
        )
            return true;

    return false;
}