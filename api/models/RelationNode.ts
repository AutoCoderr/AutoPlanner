import { Model } from "sequelize";
import sequelize from "../sequelize";

class RelationNode extends Model {
    declare parent_id: number;
    declare child_id: number;
}

RelationNode.init(
    {
    },
    { //@ts-ignore
        sequelize,
        modelName: "RelationNode",
        timestamps: false
    }
);

export default RelationNode;
