import {HasManyAddAssociationMixin, HasManySetAssociationsMixin, Optional} from "sequelize";
import TodoModel from "../../models/TodoModel";
import Todo from "../../models/Todo";
import Folder from "../../models/Folder";
import {ITodoModel} from "./TodoModel";
import {ITodo} from "./Todo";
import {IFolder} from "./Folder";
import User from "../../models/User";

export interface IUser {
    id: number;
    email: string;
    password: string;
    username: string;

    createdAt: Date;
    updatedAt: Date;

    setModels: HasManySetAssociationsMixin<TodoModel, any>;
    addModel: HasManyAddAssociationMixin<TodoModel, any>;

    setTodos: HasManySetAssociationsMixin<Todo, any>;
    addTodo: HasManyAddAssociationMixin<Todo, any>;

    setFolders: HasManySetAssociationsMixin<Folder, any>;
    addFolder: HasManyAddAssociationMixin<Folder, any>;
}
export type IUserCreation = Optional<IUser, 'id' | 'createdAt' | 'updatedAt' | 'setModels' | 'addModel' | 'setTodos' | 'addTodo' | 'setFolders' | 'addFolder'>;

export interface UserWithModels extends User {
    models: TodoModel[]
}
export interface UserWithTodos extends User {
    todos: Todo[]
}
export interface UserWithFolders extends User {
    folders: Folder[]
}