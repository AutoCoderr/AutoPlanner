import Node from "../models/Node";
import TodoModel from "../models/TodoModel";
import compileDataValues from "../libs/compileDatavalues";
import Response from "../models/Response";
import {NodeWithChildren, NodeWithModel, NodeWithParents, NodeWithResponses} from "../interfaces/models/Node";

export function findOneNodeByIdWithModel(id: number): Promise<null|NodeWithModel> {
    return <Promise<null|NodeWithModel>>Node.findOne({
        where: { id },
        include: {
            model: TodoModel,
            as: "model"
        }
    }).then(res => compileDataValues(res))
}

export function findOneNodeByIdWithChildren(id: number): Promise<null|NodeWithChildren> {
    return <Promise<null|NodeWithChildren>>Node.findOne({
        where: { id },
        include: {
            model: Node,
            as: "children"
        }
    }).then(res => compileDataValues(res))
}

export function findOneNodeByIdWithChildrenAndResponses(id: number): Promise< null | NodeWithChildren&NodeWithResponses > {
    return <Promise< null | NodeWithChildren&NodeWithResponses >>Node.findOne({
        where: { id },
        include: [
            {
                model: Response,
                as: "responses"
            },
            {
                model: Node,
                as: "children"
            }
        ]
    }).then(res => compileDataValues(res))
}

export function findOneNodeByIdWithParents(id: number): Promise<null|NodeWithParents> {
    return <Promise<null|NodeWithParents>>Node.findOne({
        where: { id },
        include: {
            model: Node,
            as: "parents"
        }
    }).then(res => compileDataValues(res))
}