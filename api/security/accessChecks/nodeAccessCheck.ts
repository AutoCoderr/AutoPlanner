import IAccessCheck from "../../interfaces/crud/security/IAccessCheck";
import {NodeWithModel} from "../../interfaces/models/Node";

const nodeAccessCheck: IAccessCheck = (node: NodeWithModel, mode, user) =>
    user !== undefined &&
    (
        (
            mode === "get" && ( node.model.user_id === user.id || node.model.published )
        ) ||
        (
            mode !== "get" && ( node.model.user_id === user.id && !node.model.published )
        )
    )

export default nodeAccessCheck;