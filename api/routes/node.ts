import {Router} from "express";
import get from "../libs/crud/requests/get";
import Node from "../models/Node";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {nodeIncludeModel} from "../includeConfigs/node";
import getNodeMiddleWare from "../middleWare/getNodeMiddleWare";
import getSubNodeRoute from "./getSubNodeRoute";
import deleteOne from "../libs/crud/requests/deleteOne";
import update from "../libs/crud/requests/update";
import getNodeForm from "../forms/getNodeForm";
import isNumber from "../libs/isNumber";
import getAndCheckExistingResource from "../libs/crud/getAndCheckExistingResource";
import {NodeWithModel} from "../interfaces/models/Node";
import subResponseRoute from "./subResponseRoute";

const router = Router();

router.get("/:id", get(Node, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.delete("/:id", deleteOne(Node, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.put("/:id", update(Node, getNodeForm, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.patch("/:id", update(Node, getNodeForm, nodeAccessCheck, {
    include: nodeIncludeModel
}));

router.patch("/:id/set_as_firstnode", async (req, res) => {
    const {id} = req.params;

    if (!isNumber(id))
        return res.sendStatus(400);

    const {elem,code} = await <Promise<{elem: null|NodeWithModel, code: null|number}>>getAndCheckExistingResource(Node, parseInt(id), "update", nodeAccessCheck, req.user, {
        include: nodeIncludeModel
    });

    if (!elem)
        return res.sendStatus(code);

    elem.model.firstnode_id = elem.id;

    elem.model.save()
        .then(() => res.sendStatus(200))
        .catch((e) => {
            console.error(e);
            res.sendStatus(500);
        })
})

router.use("/:node_id/children", getNodeMiddleWare(), getSubNodeRoute("children"));
router.use("/:node_id/parents", getNodeMiddleWare(), getSubNodeRoute("parents"));
router.use("/:node_id/responses", getNodeMiddleWare(), subResponseRoute);

export default router;