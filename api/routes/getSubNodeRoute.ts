import {Router} from "express";
import post from "../libs/crud/requests/post";
import Node from "../models/Node";
import getNodeForm from "../forms/getNodeForm";
import getAll from "../libs/crud/requests/getAll";
import {findNodeChildren, findNodeParents, findNodes} from "../repositories/NodeRepository";
import isNumber from "../libs/isNumber";
import getAndCheckExistingResource from "../libs/crud/getAndCheckExistingResource";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {nodeIncludeModel} from "../includeConfigs/node";
import {NodeWithChildren, NodeWithModel, NodeWithParents} from "../interfaces/models/Node";
import getReqData from "../libs/crud/getReqData";
import Response from "../models/Response";
import nodeCreateAccessCheck from "../security/createAccessChecks/nodeCreateAccessCheck";
import childCanBeAddedToParent from "../libs/childCanBeAddedToParent";

export default function getSubNodeRoute(subResourceType: null|'children'|'parents' = null) {
    const router = Router();

    if (subResourceType === "children")
        router.post("/", post(Node, getNodeForm, nodeCreateAccessCheck))

    if (subResourceType !== null)
        router.post("/:id", async (req, res) => {
            const reqData = getReqData(req);
            if (subResourceType === null || reqData.node === undefined)
                return res.sendStatus(404);

            const {elem, code} = await <Promise<{ elem: (NodeWithModel & NodeWithChildren) | null, code: number | null }>>getAndCheckExistingResource(Node, req, "update", nodeAccessCheck, reqData.user, {
                include: nodeIncludeModel
            });

            if (!elem)
                return res.sendStatus(code);

            const parent = subResourceType === "children" ? reqData.node : elem;
            const child = subResourceType === "children" ? elem : reqData.node;

            const children = await findNodeChildren(parent.id);

            if (
                elem.model_id !== reqData.node.model_id ||
                elem.id === reqData.node.id ||
                children.some(existingChild => existingChild.id === child.id) ||
                !childCanBeAddedToParent(parent, children)
            )
                return res.sendStatus(403);

            await parent.addChild(child);

            res.sendStatus(201);
        })

    if (subResourceType !== null)
        router.delete("/:id", (async (req, res) => {
            const reqData = getReqData(req);
            if (reqData.node === undefined)
                return res.sendStatus(400);

            const {elem,code} = await <Promise<{elem: null|(NodeWithModel&NodeWithChildren&NodeWithParents), code: null|number}>>getAndCheckExistingResource(Node, req, "update", nodeAccessCheck, req.user, {
                include: nodeIncludeModel
            });

            if (!elem)
                return res.sendStatus(code);

            const parent = subResourceType === "children" ? reqData.node : elem;
            const child = subResourceType === "children" ? elem : reqData.node

            const parents = await findNodeParents(child.id);

            if (
                !parents.some(existingParent => existingParent.id === parent.id) ||
                (child.id !== child.model.firstnode_id && parents.length === 1)
            )
                return res.sendStatus(403)

            await Response.destroy({
                where: {
                    question_id: parent.id,
                    action_id: child.id
                }
            })

            await parent.removeChild(child)

            res.sendStatus(204);
        }))

    router.get("/", getAll((reqData) => findNodes(reqData, subResourceType)))

    return router;
}
