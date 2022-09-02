import {Includeable} from "sequelize/types/model";
import Node from "../models/Node";

export const responseIncludeQuestionAndAction: Includeable[] = [
    {
        model: Node,
        as: "question"
    },
    {
        model: Node,
        as: "action"
    }
]

export const responseIncludeQuestion: Includeable = {
    model: Node,
    as: "question"
}