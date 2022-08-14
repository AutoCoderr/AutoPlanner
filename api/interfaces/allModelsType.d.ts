import Folder from "../models/Folder";
import Node from "../models/Node";
import Response from "../models/Response";
import Step from "../models/Step";
import Todo from "../models/Todo";
import TodoModel from "../models/TodoModel";
import User from "../models/User";

type allModelsTypes = typeof Folder|typeof Node|typeof Response|typeof Step|typeof Todo|typeof TodoModel|typeof User

export default allModelsTypes;