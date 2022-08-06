import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import Todo from "./Todo";
import Folder from "./Folder";

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
    },
    { //@ts-ignore
        sequelize,
        modelName: "User",
    }
);

TodoModel.belongsTo(User, {foreignKey: "user_id", as: "user"});
User.hasMany(TodoModel, {foreignKey: "user_id", as: "models"});

Todo.belongsTo(User, {foreignKey: "user_id", as: "user"});
User.hasMany(Todo, {foreignKey: "user_id", as: "todos"});

Folder.belongsTo(User, {foreignKey: "user_id", as: "user"});
User.hasMany(Folder, {foreignKey: "user_id", as: "folders"});

export default User;
