import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Response from "../models/Response";
import {NodeWithChildren, NodeWithParents, NodeWithResponses} from "../interfaces/models/Node";

export default async function canModelBePublished(model: TodoModel): Promise<boolean> {
    if (model.firstnode_id === null)
        return false;

    const nodes = await <Promise<(NodeWithParents&NodeWithChildren&NodeWithResponses)[]>>Node.findAll({
        where: {
            model_id: model.id
        },
        include: [
            {
                model: Node,
                as: "parents"
            },
            {
                model: Node,
                as: "children"
            },
            {
                model: Response,
                as: "responses"
            }
        ]
    });

    return !nodes.some(node =>
        (node.parents.length === 0 && node.id !== model.firstnode_id) ||
        (node.type === "action" && node.children.length > 1) ||
        (node.type === "question" &&
            (
                node.children.length === 0 ||
                node.children.length !== node.responses.length ||
                node.responses.some(response => !node.children.some(child => child.id === response.action_id) )
            )
        )
    )
}