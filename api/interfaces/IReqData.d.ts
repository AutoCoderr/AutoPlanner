import {IUserConnected} from "./models/User";
import Todo from "../models/Todo";
import User from "../models/User";
import Folder from "../models/Folder";
import TodoModel from "../models/TodoModel";
import {NodeWithModel} from "./models/Node";

interface IReqData {
    user?: IUserConnected;
    specifiedUser?: User;
    todo?: Todo,
    folder?: Folder,
    model?: TodoModel,
    node?: NodeWithModel
    all?: true,
    query: {[key: string]: string}
}

export default IReqData;