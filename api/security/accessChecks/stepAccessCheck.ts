import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import todoAccessCheck from "./todoAccessCheck";
import nodeAccessCheck from "./nodeAccessCheck";
import {findNodeChildren} from "../../repositories/NodeRepository";
import todoStepIsTheLastStep from "../../libs/todoStepIsTheLastStep";
import Step from "../../models/Step";
import Todo from "../../models/Todo";
import Node from "../../models/Node";
import {nodeIncludeModel} from "../../includeConfigs/node";
import {NodeWithModel} from "../../interfaces/models/Node";

const stepAccessCheck: IAccessCheck = async (step: Step, mode, user) => {
    const [todo,node] = await <Promise<[Todo,NodeWithModel]>>Promise.all([
        Todo.findOne({
            where: {
                id: step.todo_id
            }
        }),
        Node.findOne({
            where: {
                id: step.node_id
            },
            include: nodeIncludeModel
        })
    ])
    if (!todo || !node)
        return false;

    if (!todoAccessCheck(todo, mode === "get" ? "get" : "update", user) ||
        !nodeAccessCheck(node, "get", user))
        return false;

    return mode !== "delete" ||
        (
            node.model.firstnode_id !== node.id &&
            todoStepIsTheLastStep(step,todo, await findNodeChildren(step.node_id))
        )
}

export default stepAccessCheck