import {IFCreateAccessCheck} from "../../interfaces/crud/security/ICreateAccessCheck";
import childCanBeAddedToParent from "../../libs/childCanBeAddedToParent";

const nodeCreateAccessCheck: IFCreateAccessCheck<null|'children'|'parents'> = (subResourceType) => (reqData) =>
    reqData.user !== undefined &&
    (
        (reqData.node === undefined && reqData.model !== undefined) ||
        (reqData.node !== undefined && (
            subResourceType === "parents" ||
            childCanBeAddedToParent(reqData.node)
        ))
    )

export default nodeCreateAccessCheck;