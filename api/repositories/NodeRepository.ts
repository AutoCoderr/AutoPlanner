import Node from "../models/Node";
import TodoModel from "../models/TodoModel";
import compileDataValues from "../libs/compileDatavalues";
import Response from "../models/Response";
import {
    NodeWithChildren,
    NodeWithModel,
    NodeWithParents,
    NodeWithResponses
} from "../interfaces/models/Node";
import IReqData from "../interfaces/IReqData";
import RelationNode from "../models/RelationNode";
import {Op} from "sequelize";
import {Includeable} from "sequelize/types/model";

export function findOneNodeByIdWithModel(id: number): Promise<null | NodeWithModel> {
    return <Promise<null | NodeWithModel>>Node.findOne({
        where: {id},
        include: {
            model: TodoModel,
            as: "model"
        }
    })
}

export function findOneNodeByIdWithChildren(id: number): Promise<null | NodeWithChildren> {
    return <Promise<null | NodeWithChildren>>Node.findOne({
        where: {id},
        include: {
            model: Node,
            as: "children"
        }
    })
}

export function findOneNodeByIdWithChildrenAndResponses(id: number): Promise<null | NodeWithChildren & NodeWithResponses> {
    return <Promise<null | NodeWithChildren & NodeWithResponses>>Node.findOne({
        where: {id},
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

export function findOneNodeByIdWithParents(id: number): Promise<null | NodeWithParents> {
    return <Promise<null | NodeWithParents>>Node.findOne({
        where: {id},
        include: {
            model: Node,
            as: "parents"
        }
    }).then(res => compileDataValues(res))
}

export function findNodesByModelId(model_id) {
    return Node.findAll({
        where: {
            model_id
        }
    })
}

export function findNodes(reqData: IReqData, subResourceType: null | 'children' | 'parents' = null): Promise<Node[]> | Node[] {
    if (reqData.user === undefined)
        return [];

    if (reqData.node === undefined || subResourceType === null)
        return reqData.model ? findNodesByModelId(reqData.model.id) : []

    return subResourceType === "children" ? findNodeChildren(reqData.node.id) : findNodeParents(reqData.node.id);
}

export function getNodeChildrenIds(node_id: number): Promise<number[]> {
    return <Promise<number[]>>RelationNode.findAll({
        where: {
            parent_id: node_id
        }
    }).then(res => res.map(({child_id}) => child_id))
}

export function findNodeChildren(node_id: number, include: Includeable|Includeable[]|undefined = undefined): Promise<Node[]> {
    return getNodeChildrenIds(node_id)
        .then(childIds =>
            Node.findAll({
                where: {
                    id: {[Op.in]: childIds}
                },
                include
            })
        )
}

export function findNodeParents(node_id: number) {
    return RelationNode.findAll({
        where: {
            child_id: node_id
        }
    }).then(res => res.map(({parent_id}) => parent_id))
        .then(parentIds =>
            Node.findAll({
                where: {
                    id: {[Op.in]: parentIds}
                }
            })
        )
}