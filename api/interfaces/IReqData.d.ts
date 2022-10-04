import {IUserConnected} from "./models/User";
import Todo from "../models/Todo";
import User from "../models/User";
import Folder from "../models/Folder";
import TodoModel from "../models/TodoModel";
import {NodeWithChildren, NodeWithModel} from "./models/Node";
import Step from "../models/Step";
import {StepWithAssociatedFolders, StepWithAssociatedTodos} from "./models/Step";

interface IReqData {
    user?: IUserConnected;
    specifiedUser?: User;
    step?: StepWithAssociatedFolders&StepWithAssociatedTodos;
    todo?: Todo,
    folder?: Folder,
    model?: TodoModel,
    node?: NodeWithModel,
    all?: true,
    query: {[key: string]: string}
}

export default IReqData;