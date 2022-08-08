import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin, Optional
} from "sequelize";
import Node from "../models/Node";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import {INode} from "./Node";
import {IFolder} from "./Folder";
import {ITodo} from "./Todo";

export interface IStep {
    id: number;
    percent: number;
    percentSynchronized: boolean;
    nb: number;
    node_id: number;
    todo_id: number;

    setNode: BelongsToSetAssociationMixin<INode|Node, any>;
    setTodo: BelongsToSetAssociationMixin<ITodo|Todo, any>;
    setAssociatedTodos: BelongsToManySetAssociationsMixin<ITodo|Todo, any>;
    addAssociatedTodo: BelongsToManyAddAssociationMixin<ITodo|Todo, any>;
    setAssociatedFolders: BelongsToManySetAssociationsMixin<IFolder|Folder, any>;
    addAssociatedFolder: BelongsToManyAddAssociationMixin<IFolder|Folder, any>;
}
export type IStepCreation = Optional<IStep, 'id' | 'percent' | 'percentSynchronized' | 'nb' | 'setNode' | 'setTodo' | 'setAssociatedTodos' | 'addAssociatedTodo' | 'setAssociatedFolders' | 'addAssociatedFolder'>;

export interface IStepWithNode extends IStep {
    node: INode
}
export interface IStepWithTodo extends IStep {
    todo: ITodo
}
export interface IStepWithAssociatedTodos extends IStep {
    associated_todos: ITodo[]
}
export interface IStepWithAssociatedFolders extends IStep {
    associated_folders: IFolder[]
}