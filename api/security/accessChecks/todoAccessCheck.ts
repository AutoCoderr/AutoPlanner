import IAccessCheck from "../../interfaces/crud/security/IAccessCheck";
import Todo from "../../models/Todo";

const todoAccessCheck: IAccessCheck = (todo: Todo, mode, user) =>
    user !== undefined && todo.user_id === user.id

export default todoAccessCheck;