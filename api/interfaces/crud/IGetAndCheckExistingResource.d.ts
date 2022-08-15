import Folder from "../../models/Folder";
import Node from "../../models/Node";
import Response from "../../models/Response";
import Step from "../../models/Step";
import Todo from "../../models/Todo";
import TodoModel from "../../models/TodoModel";
import User from "../../models/User";
import allModelsTypes from "../allModelsType";
import IAccessCheck from "./security/IAccessCheck";
import {IUserConnected} from "../models/User";
import IGetAndCheckExistingResourceParams from "./IGetAndCheckExistingResourceParams";

type IGetAndCheckExistingResource = (
    model: allModelsTypes,
    id: number,
    mode: 'get'|'update'|'delete',
    accessCheck: IAccessCheck,
    connectedUser: undefined|IUserConnected,
    params: IGetAndCheckExistingResourceParams = {}
    ) =>
    Promise<
        {code: null, elem: Folder|Node|Response|Step|Todo|TodoModel|User} |
        {code: number, elem: null}
        >

export default IGetAndCheckExistingResource