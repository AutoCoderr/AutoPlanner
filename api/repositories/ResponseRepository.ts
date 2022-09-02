import IReqData from "../interfaces/IReqData";
import {ResponseWithAction} from "../interfaces/models/Response";
import Response from "../models/Response";
import Node from "../models/Node";

export function findResponses(reqData: IReqData): Promise<ResponseWithAction[]>|[] {
    return (reqData.user !== undefined && reqData.node !== undefined) ?
        <Promise<ResponseWithAction[]>><unknown>Response.findAll({
            where: {
                question_id: reqData.node.id
            },
            include: {
                model: Node,
                as: "action"
            }
        }) : []
}