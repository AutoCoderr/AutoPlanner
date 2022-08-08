import {
    Model,
    DataTypes,
    InferAttributes,
    BelongsToSetAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationMixin
} from "sequelize";
import sequelize from "../sequelize";
import Node from "./Node";
import Todo from "./Todo";
import User from "./User";
import {ITodoModel, ITodoModelCreation} from "../interfaces/TodoModel";
import {INode} from "../interfaces/Node";
import {ITodo} from "../interfaces/Todo";
import {IUser} from "../interfaces/User";

class TodoModel extends Model<InferAttributes<TodoModel>, ITodoModelCreation> implements ITodoModel {
    declare description: string;
    declare firstnode_id?: number;
    declare id: number;
    declare name: string;
    declare published: boolean;
    declare user_id: number;

    declare setFirstNode: BelongsToSetAssociationMixin<INode|Node, any>;
    declare setTodos: HasManySetAssociationsMixin<ITodo|Todo, any>;
    declare addTodo: HasManyAddAssociationMixin<ITodo|Todo, any>;
    declare setUser: BelongsToSetAssociationMixin<IUser|User, any>;
}

TodoModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "TodoModel",
    }
);

export default TodoModel;
