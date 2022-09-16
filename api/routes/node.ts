import {Router} from "express";
import get from "../libs/crud/requests/get";
import Node from "../models/Node";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {nodeIncludeModel, nodeIncludeModelAndChildren} from "../includeConfigs/node";
import getNodeMiddleWare from "../middleWare/getNodeMiddleWare";
import getSubNodeRoute from "./getSubNodeRoute";
import deleteOne from "../libs/crud/requests/deleteOne";
import update from "../libs/crud/requests/update";
import getNodeForm from "../forms/getNodeForm";
import subResponseRoute from "./subResponseRoute";
import {findNodeChildren, findNodeParents} from "../repositories/NodeRepository";
import {NodeWithModel} from "../interfaces/models/Node";
import deleteChildrenRecursively from "../libs/deleteChildrenRecursively";
import isNumber from "../libs/isNumber";
import getReqData from "../libs/crud/getReqData";
import post from "../libs/crud/requests/post";
import nodeCreateAccessCheck from "../security/createAccessChecks/nodeCreateAccessCheck";
import Response from "../models/Response";

const router = Router();

router.get("/:id", get(Node, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.delete("/:id", deleteOne(Node, nodeAccessCheck, {
    include: nodeIncludeModel,
    async finished(reqData, deletedNode) {
        const children = await <Promise<NodeWithModel[]>>findNodeChildren(deletedNode.id, nodeIncludeModel);
        if (['1','true'].includes(reqData.query.recreate_link) && children.length === 1) {
            const parents = await findNodeParents(deletedNode.id);

            return Promise.all(parents.map(parent => parent.addChild(children[0])));
        }
        return deleteChildrenRecursively(children);
    }
}));

router.put("/:id", update(Node, getNodeForm, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.patch("/:id", update(Node, getNodeForm, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.post("/between/:parent_id/:child_id", async (req, res) => {
    const {parent_id,child_id} = req.params;
    const reqData = getReqData(req);

    if (!isNumber(parent_id) || !isNumber(child_id))
        return res.sendStatus(400);

    const [parent,child] = await Promise.all(
        [parent_id,child_id].map(id =>
            Node.findOne({
                where: {id},
                include: nodeIncludeModel
            })
        )
    )

    if (parent === null || child === null)
        return res.sendStatus(404);

    if (
        parent.model_id !== child.model_id ||
        [parent,child].some(node => !nodeAccessCheck(node, "update", reqData.user))
    )
        return res.sendStatus(403)

    const children = await findNodeChildren(parent.id);

    if (!children.some(existingChild => existingChild.id === child.id))
        return res.sendStatus(403)

    req.node = parent;

    await post(Node, getNodeForm, nodeCreateAccessCheck, {
      async finished(_, node) {
          await parent.removeChild(child);

          const response = await Response.findOne({
              where: {
                  question_id: parent.id,
                  action_id: child.id
              }
          })

          if (response) {
              response.action_id = node.id;
              await response.save();
          }

          await node.addChild(child)
      }
    })(req,res)
})

router.use("/:node_id/children", getNodeMiddleWare(), getSubNodeRoute("children"));
router.use("/:node_id/parents", getNodeMiddleWare(), getSubNodeRoute("parents"));
router.use("/:node_id/responses", getNodeMiddleWare(), subResponseRoute);

export default router;