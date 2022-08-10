import {Model, DataTypes, InferAttributes, HasManySetAssociationsMixin, HasManyAddAssociationMixin} from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import Todo from "./Todo";
import Folder from "./Folder";
import {IUser, IUserCreation} from "../interfaces/models/User";
import bcrypt from "bcryptjs";

class User extends Model<InferAttributes<User>,IUserCreation> implements IUser {
    declare id: number;
    declare email: string;
    declare password: string;
    declare username: string;

    declare createdAt: Date;
    declare updatedAt: Date;

    declare setModels: HasManySetAssociationsMixin<TodoModel, any>;
    declare addModel: HasManyAddAssociationMixin<TodoModel, any>;

    declare setTodos: HasManySetAssociationsMixin<Todo, any>;
    declare addTodo: HasManyAddAssociationMixin<Todo, any>;

    declare setFolders: HasManySetAssociationsMixin<Folder, any>;
    declare addFolder: HasManyAddAssociationMixin<Folder, any>;

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
            allowNull: false,
            unique: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
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



const updatePassword = async (user) => {
    if ((user.type === "BULKUPDATE" && user.fields.includes('password')) ||
        (user.type === undefined && user._previousDataValues.password !== user.dataValues.password)) {

        const attributes = user.type === "BULKUPDATE" ? user.attributes : user;
        attributes.password = await bcrypt.hash(attributes.password, await bcrypt.genSalt());
    }
};

User.addHook("beforeCreate", updatePassword);
User.addHook("beforeBulkUpdate", updatePassword);
User.addHook("beforeUpdate", updatePassword);

export default User;
