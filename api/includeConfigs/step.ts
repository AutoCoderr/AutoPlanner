import {Includeable} from "sequelize/types/model";
import Node from "../models/Node";
import Todo from "../models/Todo";

export const stepWithNodeAndTodo: Includeable[] = [
    {
        model: Node,
        as: "node"
    },
    {
        model: Todo,
        as: "todo"
    }
]