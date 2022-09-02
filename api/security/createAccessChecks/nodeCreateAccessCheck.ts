import {IFCreateAccessCheck} from "../../interfaces/crud/security/ICreateAccessCheck";
import childCanBeAddToParent from "../../libs/childCanBeAddToParent";

const nodeCreateAccessCheck: IFCreateAccessCheck<null|'children'|'parents'> = (subResourceType) => (reqData) =>
    reqData.user !== undefined &&
    (
        (reqData.node === undefined && reqData.model !== undefined) ||
        (reqData.node !== undefined && (
            subResourceType === "parents" ||
            childCanBeAddToParent(reqData.node)
        ))
    )

export default nodeCreateAccessCheck;