import { Model } from "sequelize";
import sequelize from "../sequelize";

class RelationNode extends Model {}

RelationNode.init(
    {
    },
    { //@ts-ignore
        sequelize,
        modelName: "RelationNode",
    }
);

export default RelationNode;
