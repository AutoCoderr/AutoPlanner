import {IFCreateAccessCheck} from "../../interfaces/crud/security/ICreateAccessCheck";

const nodeCreateAccessCheck: IFCreateAccessCheck = (subResourceType: null|'children'|'parents') => (reqData) =>
    reqData.user !== undefined &&
    (
        (reqData.node === undefined && reqData.model !== undefined) ||
        (reqData.node !== undefined && (
            subResourceType === "parents" ||
            (reqData.node.children && reqData.node.children.length === 0) ||
            reqData.node.type === "question"
        ))
    )

export default nodeCreateAccessCheck;