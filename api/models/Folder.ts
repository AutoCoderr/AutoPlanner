import {
    Model,
    DataTypes,
    InferAttributes,
    BelongsToSetAssociationMixin,
    HasManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin, BelongsToManyAddAssociationMixin
} from "sequelize";
import sequelize from "../sequelize";
import Todo from "./Todo";
import Step from "./Step";
import User from "./User";
import {IFolder, IFolderCreation} from "../interfaces/models/Folder";

class Folder extends Model<InferAttributes<Folder>, IFolderCreation> implements IFolder {
    declare id: number;
    declare name: string;
    declare description?: string;
    declare percent: number;
    declare percentSynchronized: boolean;
    declare deadLine?: Date;
    declare priority: number;
    declare parent_id?: number;
    declare user_id: number;

    declare createdAt: Date;
    declare updatedAt: Date;

    declare setParent: BelongsToSetAssociationMixin<Folder, any>;
    declare addFolder: HasManyAddAssociationMixin<Folder, any>;
    declare addTodo: HasManyAddAssociationMixin<Todo, any>;
    declare setAssociatedSteps: BelongsToManySetAssociationsMixin<Step, any>;
    declare addAssociatedStep: BelongsToManyAddAssociationMixin<Step, any>;
    declare setUser: BelongsToSetAssociationMixin<User, any>;
}

Folder.init(
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
            allowNull: true
        },
        percentSynchronized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        modelName: "Folder",
    }
);

Folder.belongsTo(Folder, { foreignKey: "parent_id", as: "parent" });
Folder.hasMany(Folder, { foreignKey: "parent_id", as: "folders" });

//@ts-ignore
export default Folder;
