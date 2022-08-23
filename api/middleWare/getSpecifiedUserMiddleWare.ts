import middleWareGenerator from "../libs/crud/middleWareGenerator";
import User from "../models/User";
import specifiedUserAccessCheck from "../security/accessChecks/specifiedUserAccessCheck";

export default () => middleWareGenerator(User, specifiedUserAccessCheck, "specifiedUser");