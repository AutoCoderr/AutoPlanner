import {NodeWithChildren, NodeWithModel} from "../interfaces/models/Node";

const childCanBeAddedToParent = (parent: NodeWithModel&NodeWithChildren) =>
    (parent.children && parent.children.length === 0) ||
    parent.type === "question"

export default childCanBeAddedToParent;