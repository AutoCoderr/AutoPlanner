import {
    BelongsToSetAssociationMixin,
    HasManyAddAssociationMixin,
    HasManySetAssociationsMixin,
    Optional
} from "sequelize";
import Node from "../models/Node";
import Todo from "../models/Todo";
import User from "../models/User";
import {INode} from "./Node";
import {ITodo} from "./Todo";
import {IUser} from "./User";

export interface ITodoModel {
    id: number;
    name: string;
    description: string;
    published: boolean;
    firstnode_id?: number;
    user_id: number;

    setFirstNode: BelongsToSetAssociationMixin<INode|Node, any>;
    setTodos: HasManySetAssociationsMixin<ITodo|Todo, any>;
    addTodo: HasManyAddAssociationMixin<ITodo|Todo, any>;
    setUser: BelongsToSetAssociationMixin<IUser|User, any>;
}
export type ITodoModelCreation = Optional<ITodoModel, 'id' | 'description' | 'published' | 'firstnode_id' | 'setFirstNode' | 'setTodos' | 'addTodo' | 'setUser'>;

export interface ITodoModelWithFirstNode extends ITodoModel {
    firstNode: null|INode
}
export interface ITodoModelWithTodos extends ITodoModel {
    todos: ITodo[]
}
export interface ITodoModelWithUser extends ITodoModel {
    user: IUser
}