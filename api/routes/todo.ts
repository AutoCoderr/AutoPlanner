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

const router = Router();

router.get("/search", getAll(searchTodos))

router.get("/", getAll(findTodos));

router.post("/", post(Todo, getTodoForm));

router.get("/:id", get(Todo, todoAccessCheck));

router.put("/:id", update(Todo, getTodoForm, todoAccessCheck));

router.patch("/:id", update(Todo, getTodoForm, todoAccessCheck));

router.delete("/:id", deleteOne(Todo, todoAccessCheck));

export default router;