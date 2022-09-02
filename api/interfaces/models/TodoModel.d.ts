import {
    BelongsToSetAssociationMixin,
    HasManyAddAssociationMixin,
    HasManySetAssociationsMixin, InferAttributes,
    Optional
} from "sequelize";
import Node from "../../models/Node";
import Todo from "../../models/Todo";
import User from "../../models/User";
import TodoModel from "../../models/TodoModel";

export interface ITodoModel {
    id: number;
    name: string;
    description?: string;
    published: boolean;
    firstnode_id?: number;
    user_id: number;

    createdAt: Date;
    updatedAt: Date;

    setFirstNode: BelongsToSetAssociationMixin<Node, any>;
    setTodos: HasManySetAssociationsMixin<Todo, any>;
    addTodo: HasManyAddAssociationMixin<Todo, any>;
    setUser: BelongsToSetAssociationMixin<User, any>;
}
export type ITodoModelCreation = InferAttributes<Optional<ITodoModel, 'id' | 'description' | 'published' | 'firstnode_id' | 'createdAt' | 'updatedAt'>>;

export interface TodoModelWithFirstNode extends TodoModel {
    firstNode: null|Node
}
export interface TodoModelWithTodos extends TodoModel {
    todos: Todo[]
}
export interface TodoModelWithUser extends TodoModel {
    user: User
}