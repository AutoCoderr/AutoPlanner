import IAccessCheck from "../../interfaces/crud/security/IAccessCheck";
import User from "../../models/User";

const specifiedUserAccessCheck: IAccessCheck = (specifiedUser: User, mode, user) =>
    user !== undefined && mode !== "delete" &&
    (
        mode === "get" ||
        specifiedUser.id === user.id
    )

export default specifiedUserAccessCheck;