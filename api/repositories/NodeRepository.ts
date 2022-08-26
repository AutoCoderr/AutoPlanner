import Node from "../models/Node";
import TodoModel from "../models/TodoModel";
import compileDataValues from "../libs/compileDatavalues";
import Response from "../models/Response";
import {NodeWithChildren, NodeWithModel, NodeWithParents, NodeWithResponses} from "../interfaces/models/Node";
import IReqData from "../interfaces/IReqData";

export function findOneNodeByIdWithModel(id: number): Promise<null|NodeWithModel> {
    return <Promise<null|NodeWithModel>>Node.findOne({
        where: { id },
        include: {
            model: TodoModel,
            as: "model"
        }
    })
}

export function findOneNodeByIdWithChildren(id: number): Promise<null|NodeWithChildren> {
    return <Promise<null|NodeWithChildren>>Node.findOne({
        where: { id },
        include: {
            model: Node,
            as: "children"
        }
    })
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
    })
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

export function findNodes(reqData: IReqData, subResourceType: null|'children'|'parents' = null): Promise<Node[]>|Node[] {
    if (reqData.user === undefined)
        return [];

    if (reqData.node === undefined || subResourceType === null)
        return reqData.model ? Node.findAll({
            where: {
                model_id: reqData.model.id
            }
        }) : []

    return Node.findOne({
        where: {
            id: reqData.node.id
        },
        include: {
            model: Node,
            as: subResourceType
        } // @ts-ignore
    }).then((node: null|(NodeWithParents&NodeWithChildren)) => node[subResourceType].map(elem => ({
        ...compileDataValues(elem),
        RelationNode: undefined
    })))
}
