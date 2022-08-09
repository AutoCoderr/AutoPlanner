import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin, BelongsToSetAssociationMixin, HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, Optional
} from "sequelize";
import Step from "../models/Step";
import Folder from "../models/Folder";
import TodoModel from "../models/TodoModel";
import User from "../models/User";
import Todo from "../models/Todo";

export interface ITodo {
    id: number;
    name: string;
    description: string;
    percent: number;
    priority: number;
    deadLine?: Date;
    model_id?: number;
    parent_id?: number;
    user_id: number;

    createdAt: Date;
    updatedAt: Date;

    setAssociatedSteps: BelongsToManySetAssociationsMixin<Step, any>;
    addAssociatedStep: BelongsToManyAddAssociationMixin<Step, any>;
    setSteps: HasManySetAssociationsMixin<Step, any>;
    addStep: HasManyAddAssociationMixin<Step, any>;
    setParent: BelongsToSetAssociationMixin<Folder, any>;
    setModel: BelongsToSetAssociationMixin<TodoModel, any>;
    setUser: BelongsToSetAssociationMixin<User, any>;
}
export type ITodoCreation = Optional<ITodo, 'id' | 'description' | 'percent' | 'priority' | 'deadLine' | 'createdAt' | 'updatedAt' | 'setAssociatedSteps' | 'addAssociatedStep' | 'setSteps' | 'addStep' | 'setParent' | 'setModel' | 'setUser'>;

export interface TodoWithAssociatedSteps extends Todo {
    associatedSteps: Step[]
}
export interface TodoWithSteps extends Todo {
    steps: Step[]
}
export interface TodoWithParent extends Todo {
    parent: null|Folder,
}
export interface TodoWithModel extends Todo {
    model: null|TodoModel,
}
export interface TodoWithUser extends Todo {
    user: User
}