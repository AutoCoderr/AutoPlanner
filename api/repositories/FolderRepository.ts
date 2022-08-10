import Folder from "../models/Folder";
import compileDataValues from "../libs/compileDatavalues";
import Todo from "../models/Todo";
import {FolderWithFolders, FolderWithParent, FolderWithTodos} from "../interfaces/models/Folder";

export function findOneFolderByIdWithFolders(id: number): Promise<null|FolderWithFolders> {
    return <Promise<null|FolderWithFolders>>Folder.findOne({
        where: { id },
        include: {
            model: Folder,
            as: 'folders'
        }
    }).then(res => compileDataValues(res))
}

export function findOneFolderByIdWithParent(id: number): Promise<null|FolderWithParent> {
    return <Promise<null|FolderWithParent>>Folder.findOne({
        where: { id },
        include: {
            model: Folder,
            as: 'parent'
        }
    }).then(res => compileDataValues(res))
}

export function findOneFolderByIdWithTodos(id: number): Promise<null|FolderWithTodos> {
    return <Promise<null|FolderWithTodos>>Folder.findOne({
        where: { id },
        include: {
            model: Todo,
            as: 'todos'
        }
    }).then(res => compileDataValues(res))
}