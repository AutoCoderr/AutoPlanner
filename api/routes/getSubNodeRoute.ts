import {Router} from "express";
import post from "../libs/crud/requests/post";
import Node from "../models/Node";
import getNodeForm from "../forms/getNodeForm";
import getAll from "../libs/crud/requests/getAll";
import {findNodes} from "../repositories/NodeRepository";
import isNumber from "../libs/isNumber";
import getAndCheckExistingResource from "../libs/crud/getAndCheckExistingResource";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {nodeIncludeModel, nodeIncludeModelAndChildren} from "../includeConfigs/node";
import {NodeWithChildren, NodeWithModel, NodeWithParents} from "../interfaces/models/Node";
import deleteOne from "../libs/crud/requests/deleteOne";
import getReqData from "../libs/crud/getReqData";
import Response from "../models/Response";
import nodeCreateAccessCheck from "../security/createAccessChecks/nodeCreateAccessCheck";
import childCanBeAddToParent from "../libs/childCanBeAddToParent";

export default function getSubNodeRoute(subResourceType: null|'children'|'parents' = null) {
    const router = Router();

    router.post("/", post(Node, getNodeForm, nodeCreateAccessCheck(subResourceType), {
        finished: (reqData,node: Node) => {
            if (subResourceType === null || reqData.node === undefined)
                return;
            if (subResourceType === "children")
                return reqData.node.addChild(node);
            return reqData.node.addParent(node);
        }
    }))

    router.post("/:id", async (req, res) => {
        const reqData = getReqData(req);
        if (subResourceType === null || reqData.node === undefined)
            return res.sendStatus(404);

        const {id} = req.params;

        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem, code} = await <Promise<{elem: (NodeWithModel & NodeWithChildren)|null, code: number|null}>>getAndCheckExistingResource(Node, parseInt(id), "update", nodeAccessCheck, reqData.user, {
            include: nodeIncludeModel
        });
        if (!elem)
            return res.sendStatus(code);

        if (!childCanBeAddToParent(subResourceType === "children" ? reqData.node : elem))
            return res.sendStatus(403);

        if (subResourceType === "children")
            await reqData.node.addChild(elem)
        else
            await reqData.node.addParent(elem)

        res.sendStatus(201);
    })

    router.delete("/:id", subResourceType !== null ? (async (req, res) => {
        const reqData = getReqData(req);
        if (reqData.node === undefined)
            return res.sendStatus(400);

        const {id} = req.params;
        if (!isNumber(id))
            return res.sendStatus(400);

        const {elem,code} = await <Promise<{elem: null|(NodeWithModel&NodeWithChildren&NodeWithParents), code: null|number}>>getAndCheckExistingResource(Node, parseInt(id), "delete", nodeAccessCheck, req.user, {
            include: [
                nodeIncludeModel,
                {
                    model: Node,
                    as: subResourceType === "parents" ? "children" : "parents",
                    through: {
                        where: {
                            [subResourceType === "parents" ? "child_id" : "parent_id"]: reqData.node.id
                        }
                    }
                }
            ]
        });

        if (!elem)
            return res.sendStatus(code);

        await Response.destroy({
            where: {
                question_id: subResourceType === "children" ? reqData.node.id : elem.id,
                action_id: subResourceType === "parents" ? reqData.node.id : elem.id
            }
        })

        if (subResourceType === "children")
            await reqData.node.removeChild(elem);
        else
            await reqData.node.removeParent(elem);

        res.sendStatus(204);
    }) : deleteOne(Node, nodeAccessCheck, {
        include: nodeIncludeModel
    }))

    router.get("/", getAll((reqData) => findNodes(reqData, subResourceType)))

    return router;
}
