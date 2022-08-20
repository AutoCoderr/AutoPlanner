import IAccessCheck from "../../interfaces/crud/security/IAccessCheck";
import TodoModel from "../../models/TodoModel";

const modelAccessCheck: IAccessCheck = (model: TodoModel, mode, user) =>
    user !== undefined &&
    (
        (
            mode === "get" &&
            (model.user_id === user.id || model.published)
        ) ||
        (
            mode !== "get" &&
            model.user_id === user.id &&
            !model.published
        )
    )

export default modelAccessCheck;