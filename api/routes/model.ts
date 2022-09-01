import {Router} from "express";
import getAll from "../libs/crud/requests/getAll";
import post from "../libs/crud/requests/post";
import get from "../libs/crud/requests/get";
import update from "../libs/crud/requests/update";
import deleteOne from "../libs/crud/requests/deleteOne";
import {findModels} from "../repositories/ModelRepository";
import TodoModel from "../models/TodoModel";
import modelAccessCheck from "../security/accessChecks/modelAccessCheck";
import getModelForm from "../forms/getModelForm";
import getModelMiddleWare from "../middleWare/getModelMiddleWare";
import getSubNodeRoute from "./getSubNodeRoute";
import isNumber from "../libs/isNumber";
import getAndCheckExistingResource from "../libs/crud/getAndCheckExistingResource";
import getTreeObject from "../libs/getTreeObject";

const router = Router();

router.get("/", getAll(findModels));

router.post("/", post(TodoModel, getModelForm));

router.get("/:id", get(TodoModel, modelAccessCheck));

router.put("/:id", update(TodoModel, getModelForm, modelAccessCheck));

router.patch("/:id", update(TodoModel, getModelForm, modelAccessCheck, {
    checkAllFieldsUnique: true
}));

router.get("/:id/tree", async (req, res) => {
    const {id} = req.params;

    if (!isNumber(id))
        return res.sendStatus(400);

    const {elem: model, code} = await <Promise<{elem: TodoModel|null, code: number|null}>>getAndCheckExistingResource(TodoModel, parseInt(id), "get", modelAccessCheck, req.user);

    if (!model)
        return res.sendStatus(code);
    res.json(await getTreeObject(model));
})

router.delete("/:id", deleteOne(TodoModel, modelAccessCheck));

router.use("/:model_id/nodes", getModelMiddleWare(), getSubNodeRoute());

export default router;
