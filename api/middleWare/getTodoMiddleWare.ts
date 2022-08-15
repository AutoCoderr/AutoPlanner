import middleWareGenerator from "../libs/crud/middleWareGenerator";
import Todo from "../models/Todo";
import todoAccessCheck from "../security/accessChecks/todoAccessCheck";

export default () => middleWareGenerator(Todo, todoAccessCheck, "todo");