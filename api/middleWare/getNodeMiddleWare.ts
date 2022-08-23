import middleWareGenerator from "../libs/crud/middleWareGenerator";
import Node from "../models/Node";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {nodeIncludeModel} from "../includeConfigs/node";

export default () => middleWareGenerator(Node, nodeAccessCheck, "node", {
    include: nodeIncludeModel
});