import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin, BelongsToSetAssociationMixin, HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, Optional
} from "sequelize";
import Step from "../models/Step";
import Folder from "../models/Folder";
import TodoModel from "../models/TodoModel";
import User from "../models/User";
import {IStep} from "./Step";
import {IFolder} from "./Folder";
import {ITodoModel} from "./TodoModel";
import {IUser} from "./User";

export interface ITodo {
    id: number,
    name: string,
    description: string,
    percent: number,
    priority: number,
    model_id?: number,
    parent_id?: number,
    user_id: number

    setAssociatedSteps: BelongsToManySetAssociationsMixin<IStep|Step, any>;
    addAssociatedStep: BelongsToManyAddAssociationMixin<IStep|Step, any>;
    setSteps: HasManySetAssociationsMixin<IStep|Step, any>;
    addStep: HasManyAddAssociationMixin<IStep|Step, any>;
    setParent: BelongsToSetAssociationMixin<IFolder|Folder, any>;
    setModel: BelongsToSetAssociationMixin<ITodoModel|TodoModel, any>;
    setUser: BelongsToSetAssociationMixin<IUser|User, any>;
}
export type ITodoCreation = Optional<ITodo, 'id' | 'description' | 'percent' | 'priority' | 'setAssociatedSteps' | 'addAssociatedStep' | 'setSteps' | 'addStep' | 'setParent' | 'setModel' | 'setUser'>;

export interface ITodoWithAssociatedSteps extends ITodo {
    associated_steps: IStep[]
}
export interface ITodoWithSteps extends ITodo {
    steps: IStep[]
}
export interface ITodoWithParent extends ITodo {
    parent: null|IFolder,
}
export interface ITodoWithModel extends ITodo {
    model: null|ITodoModel,
}
export interface ITodoWithUser extends ITodo {
    user: IUser
}