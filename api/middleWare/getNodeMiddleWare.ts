import middleWareGenerator from "../libs/crud/middleWareGenerator";
import Node from "../models/Node";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {nodeIncludeModel} from "../includeConfigs/node";
import {Includeable} from "sequelize/types/model";

export default (include: Includeable|Includeable[] = nodeIncludeModel) => middleWareGenerator(Node, nodeAccessCheck, "node", {
    include
});