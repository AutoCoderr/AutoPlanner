import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";

class Folder extends Model {}

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
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "Folder",
    }
);

Folder.belongsTo(Folder, { foreignKey: "parent_id", as: "parent" });
Folder.hasMany(Folder, { foreignKey: "parent_id", as: "children" });

export default Folder;
