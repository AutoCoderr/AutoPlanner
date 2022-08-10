import {
    Model,
    DataTypes,
    InferAttributes,
    BelongsToManySetAssociationsMixin,
    BelongsToManyAddAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationMixin,
    BelongsToSetAssociationMixin
} from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import Folder from "./Folder";
import Step from "./Step";
import User from "./User";
import {ITodo, ITodoCreation} from "../interfaces/models/Todo";


class Todo extends Model<InferAttributes<Todo>, ITodoCreation> implements ITodo {
    declare id: number;
    declare description: string;
    declare name: string;
    declare percent: number;
    declare priority: number;
    declare deadLine?: Date;
    declare user_id: number;
    declare model_id?: number;
    declare parent_id?: number;

    declare createdAt: Date;
    declare updatedAt: Date;

    declare setAssociatedSteps: BelongsToManySetAssociationsMixin<Step, any>;
    declare addAssociatedStep: BelongsToManyAddAssociationMixin<Step, any>;
    declare setSteps: HasManySetAssociationsMixin<Step, any>;
    declare addStep: HasManyAddAssociationMixin<Step, any>;
    declare setParent: BelongsToSetAssociationMixin<Folder, any>;
    declare setModel: BelongsToSetAssociationMixin<TodoModel, any>;
    declare setUser: BelongsToSetAssociationMixin<User, any>;
}

Todo.init(
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
        percent: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        priority: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        deadLine: {
            type: DataTypes.DATE,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "Todo",
    }
);

Todo.belongsTo(TodoModel, { foreignKey: "model_id", as: "model" });
TodoModel.hasMany(Todo, { foreignKey: "model_id", as: "todos" });

Todo.belongsTo(Folder, { foreignKey: "parent_id", as: "parent" });
Folder.hasMany(Todo, { foreignKey: "parent_id", as: "todos" });

export default Todo;
