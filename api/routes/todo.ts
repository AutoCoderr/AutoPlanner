import {Router} from "express";
import get from "../libs/crud/requests/get";
import Todo from "../models/Todo";
import todoAccessCheck from "../security/accessChecks/todoAccessCheck";
import getAll from "../libs/crud/requests/getAll";
import {findTodos, searchTodos} from "../repositories/TodoRepository";
import post from "../libs/crud/requests/post";
import getTodoForm from "../forms/getTodoForm";
import deleteOne from "../libs/crud/requests/deleteOne";
import update from "../libs/crud/requests/update";
import getTodoMiddleWare from "../middleWare/getTodoMiddleWare";
import step from "./step";
import isNumber from "../libs/isNumber";
import getAndCheckExistingResource from "../libs/crud/getAndCheckExistingResource";
import getReqData from "../libs/crud/getReqData";
import createFirstStepOnTodo from "../libs/createFirstStepOnTodo";

const router = Router();

router.get("/search", getAll(searchTodos))

router.get("/", getAll(findTodos));

router.post("/", post(Todo, getTodoForm));

router.get("/:id", get(Todo, todoAccessCheck));

router.put("/:id", update(Todo, getTodoForm, todoAccessCheck));

router.patch("/:id", update(Todo, getTodoForm, todoAccessCheck));

router.delete("/:id", deleteOne(Todo, todoAccessCheck));

router.post("/:id/first_step", async (req, res) => {
    const {id} = req.params;

    if (!isNumber(id))
        return res.sendStatus(400);

    const reqData = getReqData(req)

    const {elem, code} = await getAndCheckExistingResource(Todo, parseInt(id), "update", todoAccessCheck, reqData.user)

    if (!elem)
        return res.sendStatus(code)

    const step = await createFirstStepOnTodo(elem)

    if (step)
        return res.status(201).json(step)

    res.sendStatus(409)
})

router.use("/:todo_id/steps", getTodoMiddleWare(), step)

export default router;