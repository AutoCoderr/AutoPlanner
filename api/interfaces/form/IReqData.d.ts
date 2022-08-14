import {IUserConnected} from "../models/User";
import Todo from "../../models/Todo";
import User from "../../models/User";

interface IReqData {
    user?: IUserConnected;
    specifiedUser?: User;
    todo?: Todo
}

export default IReqData;