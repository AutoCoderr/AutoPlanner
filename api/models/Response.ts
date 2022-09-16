import {Model, DataTypes, InferAttributes, BelongsToSetAssociationMixin} from "sequelize";
import sequelize from "../sequelize";
import Node from "./Node";
import {IResponse, IResponseCreation} from "../interfaces/models/Response";

class Response extends Model<InferAttributes<Response>, IResponseCreation> implements IResponse {
    declare id: number;
    declare text: string;
    declare question_id: number;
    declare action_id: number;

    declare setQuestion: BelongsToSetAssociationMixin<Node, any>;
    declare setAction: BelongsToSetAssociationMixin<Node, any>;
}

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
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        action_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    { //@ts-ignore
        sequelize,
        modelName: "Response",
        timestamps: false
    }
);

Response.belongsTo(Node, { foreignKey: "question_id", as: "question", onDelete: 'CASCADE' });
Node.hasMany(Response, { foreignKey: "question_id", as: "responses" });
Node.hasMany(Response, { foreignKey: "action_id", as: "related_responses" })

Response.belongsTo(Node, { foreignKey: "action_id", as: "action", onDelete: 'CASCADE' });

export default Response;
