import {Includeable} from "sequelize/types/model";
import Node from "../models/Node";
import Todo from "../models/Todo";
import Folder from "../models/Folder";

export const stepIncludeNodeAndTodo: Includeable[] = [
    {
        model: Node,
        as: "node"
    },
    {
        model: Todo,
        as: "todo"
    }
]

export const stepIncludeAssociatedFolders: Includeable = {
    model: Folder,
    as: "associatedFolders"
}

export const stepIncludeAssociatedTodos: Includeable = {
    model: Todo,
    as: "associatedTodos"
}

export const stepIncludeAssociatedFoldersAndTodos: Includeable[] = [
    stepIncludeAssociatedFolders,
    stepIncludeAssociatedTodos
]