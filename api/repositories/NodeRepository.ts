import Node from "../models/Node";
import TodoModel from "../models/TodoModel";
import compileDataValues from "../libs/compileDatavalues";
import Response from "../models/Response";
import {INodeWithChildren, INodeWithModel, INodeWithParents, INodeWithResponses} from "../interfaces/Node";

export function findOneNodeByIdWithModel(id: number): Promise<null|INodeWithModel> {
    return <Promise<null|INodeWithModel>>Node.findOne({
        where: { id },
        include: {
            model: TodoModel,
            as: "model"
        }
    }).then(res => compileDataValues(res))
}

export function findOneNodeByIdWithChildren(id: number): Promise<null|INodeWithChildren> {
    return <Promise<null|INodeWithChildren>>Node.findOne({
        where: { id },
        include: {
            model: Node,
            as: "children"
        }
    }).then(res => compileDataValues(res))
}

export function findOneNodeByIdWithChildrenAndResponses(id: number): Promise< null | INodeWithChildren&INodeWithResponses > {
    return <Promise< null | INodeWithChildren&INodeWithResponses >>Node.findOne({
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

export function findOneNodeByIdWithParents(id: number): Promise<null|INodeWithParents> {
    return <Promise<null|INodeWithParents>>Node.findOne({
        where: { id },
        include: {
            model: Node,
            as: "parents"
        }
    }).then(res => compileDataValues(res))
}