import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import {NodeWithModel} from "../../interfaces/models/Node";
import modelAccessCheck from "./modelAccessCheck";

const nodeAccessCheck: IAccessCheck = (node: NodeWithModel, mode, user) =>
   modelAccessCheck(node.model, mode, user);

export default nodeAccessCheck;
