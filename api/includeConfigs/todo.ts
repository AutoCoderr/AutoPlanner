import {Includeable} from "sequelize/types/model";
import TodoModel from "../models/TodoModel";

export const todoIncludeModel: Includeable = {
    model: TodoModel,
    as: "model"
}