import IAccessCheck from "../../interfaces/crud/security/IAccessCheck";
import {ResponseWithQuestion} from "../../interfaces/models/Response";
import TodoModel from "../../models/TodoModel";

const responseAccessCheck: IAccessCheck = async (response: ResponseWithQuestion, mode, user) => {
    if (user === undefined)
        return false;
    const model: null|TodoModel = await TodoModel.findOne({
        where: {
            id: response.question.model_id
        }
    });
    if (model === null)
        return false;

    return (
        (
            mode === "get" && ( model.user_id === user.id || model.published )
        ) ||
        (
            mode !== "get" && ( model.user_id === user.id && !model.published )
        )
    )
}

export default responseAccessCheck;