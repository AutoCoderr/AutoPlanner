import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";

class TodoModel extends Model {}

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
    },
    { //@ts-ignore
        sequelize,
        modelName: "TodoModel",
    }
);

export default TodoModel;
