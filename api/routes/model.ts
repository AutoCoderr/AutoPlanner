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

const router = Router();

router.get("/", getAll(findModels));

router.post("/", post(TodoModel, getModelForm));

router.get("/:id", get(TodoModel, modelAccessCheck));

router.put("/:id", update(TodoModel, getModelForm, modelAccessCheck));

router.patch("/:id", update(TodoModel, getModelForm, modelAccessCheck, {
    checkAllFieldsUnique: true
}));

router.delete("/:id", deleteOne(TodoModel, modelAccessCheck));

export default router;