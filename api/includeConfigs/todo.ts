import {Includeable} from "sequelize/types/model";
import TodoModel from "../models/TodoModel";
import Step from "../models/Step";

export const todoIncludeModel: Includeable = {
    model: TodoModel,
    as: "model"
}

export const todoIncludeAssociatedSteps: Includeable = {
    model: Step,
    as: "associatedSteps"
}