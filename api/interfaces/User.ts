import {HasManyAddAssociationMixin, HasManySetAssociationsMixin, Optional} from "sequelize";
import TodoModel from "../models/TodoModel";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import {ITodoModel} from "./TodoModel";
import {ITodo} from "./Todo";
import {IFolder} from "./Folder";

export interface IUser {
    id: number;
    email: string;
    password: string;
    username: string;

    setModels: HasManySetAssociationsMixin<ITodoModel|TodoModel, any>;
    addModel: HasManyAddAssociationMixin<ITodoModel|TodoModel, any>;

    setTodos: HasManySetAssociationsMixin<ITodo|Todo, any>;
    addTodo: HasManyAddAssociationMixin<ITodo|Todo, any>;

    setFolders: HasManySetAssociationsMixin<IFolder|Folder, any>;
    addFolder: HasManyAddAssociationMixin<IFolder|Folder, any>;
}
export type IUserCreation = Optional<IUser, 'id' | 'setModels' | 'addModel' | 'setTodos' | 'addTodo' | 'setFolders' | 'addFolder'>;

export interface IUserWithModels extends IUser {
    models: ITodoModel[]
}
export interface IUserWithTodos extends IUser {
    todos: ITodo[]
}
export interface IUserWithFolders extends IUser {
    folders: IFolder[]
}