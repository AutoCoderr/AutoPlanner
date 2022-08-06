import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import Folder from "./Folder";

class Todo extends Model {}

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
