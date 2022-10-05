import Todo from "../../models/Todo";
import {findNodeChildren, findNodesByModelId, getNodeChildrenIds} from "../../repositories/NodeRepository";
import Step from "../../models/Step";
import TodoModel from "../../models/TodoModel";
import Node from "../../models/Node";
import compileDataValues from "../compileDatavalues";

async function recursivelyGetTodoSteps(todo: Todo, node_id: number, parentStep: Step|null = null, steps: Step[] = []): Promise<Step[]> {
    const step = await Step.findOne({
        where: {
            node_id,
            todo_id: todo.id
        },
        limit: 1,
        order: [
            ['createdAt', 'desc']
        ]
    })

    if (step === null || (parentStep !== null && step.createdAt < parentStep.createdAt))
        return steps;

    const childrenIds = await getNodeChildrenIds(node_id);

    const newSteps = [...steps, step];

    return await Promise.all(
        childrenIds.map(child_id => recursivelyGetTodoSteps(todo, child_id, step, newSteps))
    )
        .then(arrays =>
            arrays.reduce((acc: Step[],array) =>
                    array.length > acc.length ? array : acc
                , arrays[0])
        )
}

async function getNbStepToTreeEndingWithMultiBranchesAverage(node: Node, traveledNodes: {[id: string]: true} = {[node.id]: true}, nb = 0) {
    const children = await findNodeChildren(node.id);

    if (children.length === 0)
        return nb;

    const filteredChildren = children.filter(child => traveledNodes[child.id] === undefined);

    if (filteredChildren.length === 0)
        return null;

    return Promise.all(
        filteredChildren.map(child =>
            getNbStepToTreeEndingWithMultiBranchesAverage(
                child,
                {
                    ...traveledNodes,
                    [child.id]: true
                },
                nb + 1)
        )
    )
        .then(subNbs => {
            const filteredSubNbs = subNbs.filter(subNb => subNb !== null);
            if (filteredSubNbs.length === 0)
                return null;

            const sumNbs = filteredSubNbs
                .map(subNb => subNb - nb)
                .reduce((acc, subNb) => acc + subNb, 0)

            return (sumNbs / filteredSubNbs.length) + nb
        })
}

export default async function calculSynchronizedTodoPercent(todo: Todo): Promise<null|number> {
    if (!todo.percentSynchronized || todo.model_id === null)
        return null;

    const model = await TodoModel.findOne({
        where: {
            id: todo.model_id
        }
    });

    if (model === null)
        return null;

    const steps = await recursivelyGetTodoSteps(todo, <number>model.firstnode_id);

    const lastStep = steps.reduce((acc, step) => step.createdAt > acc.createdAt ? step : acc, steps[0])

    const lastStepNode = await <Promise<Node>>Node.findOne({
        where: {id: lastStep.node_id}
    });

    const nbStepToTheTreeEnd = await getNbStepToTreeEndingWithMultiBranchesAverage(
        lastStepNode,
        steps.reduce((acc,step) => ({
            ...acc,
            [step.node_id]: true
        }), {})
    );

    const nbTotalSteps = steps.length + nbStepToTheTreeEnd;

    return (steps.reduce((acc,step) => acc+step.percent , 0) / (nbTotalSteps * 100)) * 100;
}