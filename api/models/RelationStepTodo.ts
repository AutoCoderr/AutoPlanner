import { Model } from "sequelize";
import sequelize from "../sequelize";

class RelationStepTodo extends Model {}

RelationStepTodo.init(
    {
    },
    { //@ts-ignore
        sequelize,
        modelName: "RelationStepTodo",
    }
);

export default RelationStepTodo;
