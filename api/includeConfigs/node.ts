import {Includeable} from "sequelize/types/model";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Response from "../models/Response";

export const nodeIncludeModel: Includeable = {
    model: TodoModel,
    as: "model"
}

export const nodeIncludeModelAndChildren: Includeable[] = [
    nodeIncludeModel,
    {
        model: Node,
        as: "children"
    }
]

export const nodeIncludeModelAndParents: Includeable[] = [
    nodeIncludeModel,
    {
        model: Node,
        as: "parents"
    }
]

export const nodeIncludeResponses: Includeable = {
    model: Response,
    as: "responses"
}
