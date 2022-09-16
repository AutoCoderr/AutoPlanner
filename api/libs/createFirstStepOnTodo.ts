import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Step from "../models/Step";
import Todo from "../models/Todo";

export default async function createFirstStepOnTodo(todo: Todo): Promise<false|Step> {
    if (todo.model_id === null)
        return false;

    const model = await TodoModel.findOne({
        where: {
            id: todo.model_id
        }
    })

    if (model === null || model.firstnode_id === null)
        return false;

    const firstnode = await Node.findOne({
        where: {
            id: model.firstnode_id
        }
    })

    if (firstnode === null)
        return false;

    const step = await Step.findOne({
        where: {
            node_id: firstnode.id,
            todo_id: todo.id
        }
    })
    if (step !== null)
        return false;

    return Step.create({
        node_id: firstnode.id,
        todo_id: todo.id
    })
}