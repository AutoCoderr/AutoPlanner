import { Model } from "sequelize";
import sequelize from "../sequelize";

class RelationStepFolder extends Model {
    declare step_id: number;
    declare folder_id: number;
}

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
