import {NodeWithModel} from "../interfaces/models/Node";
import Node from "../models/Node";

const childCanBeAddedToParent = (parent: NodeWithModel, children: Node[]) =>
    children.length === 0 ||
    parent.type === "question"

export default childCanBeAddedToParent;