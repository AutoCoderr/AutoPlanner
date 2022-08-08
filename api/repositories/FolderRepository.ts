import Folder from "../models/Folder";
import compileDataValues from "../libs/compileDatavalues";
import Todo from "../models/Todo";
import {IFolderWithFolders, IFolderWithParent, IFolderWithTodos} from "../interfaces/Folder";

export function findOneFolderByIdWithFolders(id: number): Promise<null|IFolderWithFolders> {
    return <Promise<null|IFolderWithFolders>>Folder.findOne({
        where: { id },
        include: {
            model: Folder,
            as: 'folders'
        }
    }).then(res => compileDataValues(res))
}

export function findOneFolderByIdWithParent(id: number): Promise<null|IFolderWithParent> {
    return <Promise<null|IFolderWithParent>>Folder.findOne({
        where: { id },
        include: {
            model: Folder,
            as: 'parent'
        }
    }).then(res => compileDataValues(res))
}

export function findOneFolderByIdWithTodos(id: number): Promise<null|IFolderWithTodos> {
    return <Promise<null|IFolderWithTodos>>Folder.findOne({
        where: { id },
        include: {
            model: Todo,
            as: 'todos'
        }
    }).then(res => compileDataValues(res))
}