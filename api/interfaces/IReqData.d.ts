import {IUserConnected} from "./models/User";
import Todo from "../models/Todo";
import User from "../models/User";
import Folder from "../models/Folder";

interface IReqData {
    user?: IUserConnected;
    specifiedUser?: User;
    todo?: Todo,
    folder?: Folder
}

export default IReqData;