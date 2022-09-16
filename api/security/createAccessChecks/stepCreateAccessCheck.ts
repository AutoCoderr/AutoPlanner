import {ICreateAccessCheck} from "../../interfaces/crud/security/ICreateAccessCheck";

const stepCreateAccessCheck: ICreateAccessCheck = (reqData) =>
    reqData.todo !== undefined && reqData.todo.model_id !== null

export default stepCreateAccessCheck;