import {
    Model,
    DataTypes,
    InferAttributes,
    BelongsToManySetAssociationsMixin,
    BelongsToManyAddAssociationMixin,
    BelongsToSetAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationMixin
} from "sequelize";
import sequelize from "../sequelize";
import TodoModel from "./TodoModel";
import RelationNode from "./RelationNode";
import Response from "./Response";
import {INode, INodeCreation} from "../interfaces/Node";
import {ITodoModel} from "../interfaces/TodoModel";
import {IResponse} from "../interfaces/Response";

class Node extends Model<InferAttributes<Node>, INodeCreation> implements INode {
    declare id: number;
    declare model_id: number;
    declare text: string;
    declare type: "action" | "question";

    declare setParents: BelongsToManySetAssociationsMixin<INode|Node, any>;
    declare addParent: BelongsToManyAddAssociationMixin<INode|Node, any>;
    declare setChildren: BelongsToManySetAssociationsMixin<INode|Node, any>;
    declare addChild: BelongsToManyAddAssociationMixin<INode|Node, any>;
    declare setModel: BelongsToSetAssociationMixin<ITodoModel|TodoModel, any>;
    declare setResponses: HasManySetAssociationsMixin<IResponse|Response, any>;
    declare addResponse: HasManyAddAssociationMixin<IResponse|Response, any>
}

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
        },
        model_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "Node",
        timestamps: false
    }
);

Node.belongsToMany(Node, { through: RelationNode, foreignKey: "child_id", as: "parents" });
Node.belongsToMany(Node, { through: RelationNode, foreignKey: "parent_id", as: "children" });

Node.belongsTo(TodoModel, { foreignKey: "model_id", as: "model" });
TodoModel.belongsTo(Node, { foreignKey: "firstnode_id", as: "firstNode" });

export default Node;
