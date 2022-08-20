import middleWareGenerator from "../libs/crud/middleWareGenerator";
import TodoModel from "../models/TodoModel";
import modelAccessCheck from "../security/accessChecks/modelAccessCheck";

export default () => middleWareGenerator(TodoModel, modelAccessCheck, "model");