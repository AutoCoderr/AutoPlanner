import {Model, DataTypes, InferAttributes, HasManySetAssociationsMixin, HasManyAddAssociationMixin} from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import Todo from "./Todo";
import Folder from "./Folder";
import {IUser, IUserCreation} from "../interfaces/User";
import { ITodoModel } from "../interfaces/TodoModel";
import {ITodo} from "../interfaces/Todo";
import {IFolder} from "../interfaces/Folder";

class User extends Model<InferAttributes<User>,IUserCreation> implements IUser {
    declare id: number;
    declare email: string;
    declare password: string;
    declare username: string;

    declare setModels: HasManySetAssociationsMixin<ITodoModel|TodoModel, any>;
    declare addModel: HasManyAddAssociationMixin<ITodoModel|TodoModel, any>;

    declare setTodos: HasManySetAssociationsMixin<ITodo|Todo, any>;
    declare addTodo: HasManyAddAssociationMixin<ITodo|Todo, any>;

    declare setFolders: HasManySetAssociationsMixin<IFolder|Folder, any>;
    declare addFolder: HasManyAddAssociationMixin<IFolder|Folder, any>;
}

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
