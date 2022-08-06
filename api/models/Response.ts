import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Node from "./Node";

class Response extends Model {}

Response.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        text: {
            type: DataTypes.STRING(140),
            allowNull: false,
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "Response",
    }
);

Response.belongsTo(Node, { foreignKey: "question_id", as: "question" });
Node.hasMany(Response, { foreignKey: "question_id", as: "responses" });

Response.belongsTo(Node, { foreignKey: "action_id", as: "action" });

export default Response;
