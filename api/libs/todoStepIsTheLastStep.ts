import Step from "../models/Step";
import Todo from "../models/Todo";
import Node from "../models/Node";

export default async function todoStepIsTheLastStep(step: Step, todo: Todo, children: Node[]) {
    const childSteps = await Promise.all(
        children.map(child =>
                Step.findAll({
                    where: {
                        todo_id: todo.id,
                        node_id: child.id
                    },
                    order: [
                        ['nb', 'desc']
                    ],
                    limit: 1
                }).then(steps => steps.length > 0 ? steps[0] : null)
        )
    )

    return !childSteps.some(childStep =>
        childStep !== null && childStep.createdAt >= step.createdAt
    )
}