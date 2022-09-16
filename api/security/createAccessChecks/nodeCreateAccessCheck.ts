import {ICreateAccessCheck} from "../../interfaces/crud/security/ICreateAccessCheck";
import childCanBeAddedToParent from "../../libs/childCanBeAddedToParent";
import {findNodeChildren} from "../../repositories/NodeRepository";

const nodeCreateAccessCheck: ICreateAccessCheck = async (reqData) =>
    reqData.user !== undefined && reqData.node !== undefined &&
        childCanBeAddedToParent(
            reqData.node,
            await findNodeChildren(reqData.node.id)
        )

export default nodeCreateAccessCheck;