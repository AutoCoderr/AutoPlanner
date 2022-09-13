import {IAccessCheck} from "../../interfaces/crud/security/IAccessCheck";
import {StepWithNode, StepWithTodo} from "../../interfaces/models/Step";
import todoAccessCheck from "./todoAccessCheck";
import nodeAccessCheck from "./nodeAccessCheck";
import {findNodeChildren} from "../../repositories/NodeRepository";
import todoStepIsTheLastStep from "../../libs/todoStepIsTheLastStep";

const stepAccessCheck: IAccessCheck = async (step: StepWithNode&StepWithTodo, mode, user) => {
    if (!todoAccessCheck(step.todo, mode === "get" ? "get" : "update", user) ||
        !nodeAccessCheck(step.node, "get", user))
        return false;

    if (mode === "get")
        return true

    const children = await findNodeChildren(step.node_id);

    return todoStepIsTheLastStep(step,step.todo, children);
}

export default stepAccessCheck