import {Router} from "express";
import get from "../libs/crud/requests/get";
import Todo from "../models/Todo";
import todoAccessCheck from "../security/accessChecks/todoAccessCheck";
import getAll from "../libs/crud/requests/getAll";
import todoGetAllAccessCheck from "../security/getAllAccessChecks/todoGetAllAccessCheck";
import {findTodos} from "../repositories/TodoRepository";
import post from "../libs/crud/requests/post";
import getTodoForm from "../forms/getTodoForm";
import todoCreateAccessCheck from "../security/createWriteChecks/todoCreateAccessCheck";
import put from "../libs/crud/requests/put";
import deleteOne from "../libs/crud/requests/deleteOne";
import patch from "../libs/crud/requests/patch";
import extractFields from "../libs/form/extractFields";

const router = Router();

router.get("/:id", get(Todo, todoAccessCheck));

router.get("/", getAll(todoGetAllAccessCheck, findTodos));

router.post("/", post(Todo, getTodoForm, todoCreateAccessCheck));

router.put("/:id", put(Todo, getTodoForm, todoAccessCheck));

for (const field of ['name','description','percent','priority','deadLine']) {
    router.patch("/:id/"+field, patch(Todo, getTodoForm, extractFields(field), todoAccessCheck))
}

router.delete("/:id", deleteOne(Todo, todoAccessCheck));

export default router;