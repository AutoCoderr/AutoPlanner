import { Model } from "sequelize";
import sequelize from "../sequelize";

class RelationStepFolder extends Model {}

RelationStepFolder.init(
    {
    },
    { //@ts-ignore
        sequelize,
        modelName: "RelationStepFolder",
        timestamps: false
    }
);

export default RelationStepFolder;
