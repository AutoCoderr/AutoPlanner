import {Router} from "express";
import get from "../libs/crud/requests/get";
import Todo from "../models/Todo";
import todoAccessCheck from "../security/accessChecks/todoAccessCheck";
import getAll from "../libs/crud/requests/getAll";
import {findTodos} from "../repositories/TodoRepository";
import post from "../libs/crud/requests/post";
import getTodoForm from "../forms/getTodoForm";
import deleteOne from "../libs/crud/requests/deleteOne";
import extractFields from "../libs/form/extractFields";
import update from "../libs/crud/requests/update";

const router = Router();

router.get("/", getAll(findTodos));

router.post("/", post(Todo, getTodoForm));

router.get("/:id", get(Todo, todoAccessCheck));

router.put("/:id", update(Todo, getTodoForm, todoAccessCheck));

for (const field of (['name','description','percent','priority','deadLine','parent_id'])) {
    router.patch("/:id/"+field, update(Todo, getTodoForm, todoAccessCheck,extractFields(field)));
}

router.delete("/:id", deleteOne(Todo, todoAccessCheck));

export default router;