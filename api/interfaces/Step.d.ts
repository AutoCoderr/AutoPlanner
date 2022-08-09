import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin, Optional
} from "sequelize";
import Node from "../models/Node";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import Step from "../models/Step";

export interface IStep {
    id: number;
    percent: number;
    percentSynchronized: boolean;
    nb: number;
    deadLine?: Date;
    node_id: number;
    todo_id: number;

    createdAt: Date;
    updatedAt: Date;

    setNode: BelongsToSetAssociationMixin<Node, any>;
    setTodo: BelongsToSetAssociationMixin<Todo, any>;
    setAssociatedTodos: BelongsToManySetAssociationsMixin<Todo, any>;
    addAssociatedTodo: BelongsToManyAddAssociationMixin<Todo, any>;
    setAssociatedFolders: BelongsToManySetAssociationsMixin<Folder, any>;
    addAssociatedFolder: BelongsToManyAddAssociationMixin<Folder, any>;
}
export type IStepCreation = Optional<IStep, 'id' | 'percent' | 'percentSynchronized' | 'nb' | 'deadLine' | 'createdAt' | 'updatedAt' | 'setNode' | 'setTodo' | 'setAssociatedTodos' | 'addAssociatedTodo' | 'setAssociatedFolders' | 'addAssociatedFolder'>;

export interface StepWithNode extends Step {
    node: Node
}
export interface StepWithTodo extends Step {
    todo: Todo
}
export interface StepWithAssociatedTodos extends Step {
    associatedTodos: Todo[]
}
export interface StepWithAssociatedFolders extends Step {
    associatedFolders: Folder[]
}