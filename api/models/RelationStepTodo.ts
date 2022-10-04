import { Model } from "sequelize";
import sequelize from "../sequelize";

class RelationStepTodo extends Model {
    declare step_id: number;
    declare todo_id: number;
}

RelationStepTodo.init(
    {
    },
    { //@ts-ignore
        sequelize,
        modelName: "RelationStepTodo",
        timestamps: false
    }
);

export default RelationStepTodo;
