import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import {NodeWithModel} from "../../interfaces/models/Node";
import modelAccessCheck from "./modelAccessCheck";

const nodeAccessCheck: IAccessCheck = (node: NodeWithModel, mode, user) =>
   modelAccessCheck(node.model, mode === "get" ? "get" : "update", user) &&
    (
        mode !== "delete" || node.id !== node.model.firstnode_id
    )

export default nodeAccessCheck;
