import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin,
    HasManyAddAssociationMixin, Optional
} from "sequelize";
import Folder from "../models/Folder";
import Todo from "../models/Todo";
import Step from "../models/Step";
import User from "../models/User";
import {ITodo} from "./Todo";
import {IStep} from "./Step";
import {IUser} from "./User";

export interface IFolder {
    id: number;
    name: string;
    description?: string;
    percent: number;
    percentSynchronized: boolean;
    priority: number;
    parent_id?: number;
    user_id: number;

    setParent: BelongsToSetAssociationMixin<IFolder|Folder, any>;
    addFolder: HasManyAddAssociationMixin<IFolder|Folder, any>;
    addTodo: HasManyAddAssociationMixin<ITodo|Todo, any>;
    setAssociatedSteps: BelongsToManySetAssociationsMixin<IStep|Step, any>;
    addAssociatedStep: BelongsToManyAddAssociationMixin<IStep|Step, any>;
    setUser: BelongsToSetAssociationMixin<IUser|User, any>;
}
export type IFolderCreation = Optional<IFolder, 'id' | 'description' | 'percent' | 'percentSynchronized' | 'priority' | 'parent_id' | 'setParent' | 'addFolder' | 'addTodo' | 'setAssociatedSteps' | 'addAssociatedStep' | 'setUser'>;

export interface IFolderWithParent extends IFolder {
    parent: null|IFolder
}
export interface IFolderWithFolders extends IFolder {
    folders: IFolder[]
}
export interface IFolderWithTodos extends IFolder {
    todos: ITodo[]
}
export interface IFolderWithAssociatedSteps extends IFolder {
    associated_steps: IStep[]
}
export interface IFolderWithUser extends IFolder {
    user: IUser
}