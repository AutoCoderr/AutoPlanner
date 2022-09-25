import {InferAttributes} from "sequelize";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Response from "../models/Response";
import Step from "../models/Step";
import Todo from "../models/Todo";

export interface IModelWithTree {
    model: InferAttributes<TodoModel>;
    todo?: InferAttributes<Todo>;
    tree: IModelTree;
}

export interface IModelTree {
    [id: string]:
        (
            InferAttributes<Node> &
            {
                parents: number[];
                children: number[];
                responsesByActionId?: {[action_id: string]: InferAttributes<Response>};
                steps?: InferAttributes<Step>[]
            }
        )
}