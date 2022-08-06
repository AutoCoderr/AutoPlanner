import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import RelationNode from "./RelationNode";

class Node extends Model {}

export const actionType = "action";
export const questionType = "question";

Node.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        text: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "Node",
    }
);

Node.belongsToMany(Node, { through: RelationNode, foreignKey: "parent_id", as: "parents" });
Node.belongsToMany(Node, { through: RelationNode, foreignKey: "child_id", as: "children" });

Node.belongsTo(TodoModel, { foreignKey: "model_id", as: "model" });
TodoModel.belongsTo(Node, { foreignKey: "firstnode_id", as: "firstNode" });

export default Node;
