import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import compileDataValues from "./compileDatavalues";
import Response from "../models/Response";
import Todo from "../models/Todo";
import Step from "../models/Step";
import RelationNode from "../models/RelationNode";
import {IModelTree, IModelWithTree} from "../interfaces/IModelTree";


export default async function getTreeObject(
    model: TodoModel,
    todo: null|Todo = null,
    nodes: null|Node[] = null,
    tree: IModelTree = {}): Promise<IModelWithTree>
{
    const nodesArray = nodes instanceof Array ? nodes : await Node.findAll({
        where: {
            model_id: model.id
        }
    });

    if (nodesArray.length === 0)
        return {
            model: compileDataValues(model),
            tree,
            ...(
                todo ? {
                    todo: {
                        ...compileDataValues(todo),
                        model: undefined
                    }
                } : {}
            )
        };

    const node = nodesArray[0];

    const steps = todo !== null ?
        await Step.findAll({
            where: {
                node_id: node.id,
                todo_id: todo.id
            },
            order: [
                ['nb', 'DESC']
            ]
        }) : null

    if (todo !== null && steps && steps.length === 0)
        return getTreeObject(
            model,
            todo,
            nodesArray.slice(1),
            tree
        );

    const responses = (node.type === "question" && tree[node.id] === undefined) ?
            await Response.findAll({
                where: {
                    question_id: node.id,
                }
            }) : null;

    const parents = await RelationNode.findAll({
        where: {
            child_id: node.id
        }
    }).then(relations => relations.map(({parent_id}) => parent_id))

    const children = await RelationNode.findAll({
        where: {
            parent_id: node.id
        }
    }).then(relations => relations.map(({child_id}) => child_id))

    const newTree = {
        ...tree,
        [node.id]: {
            ...(compileDataValues(node)),
            parents,
            children,
            ...(
                (responses && responses.length > 0) ? {
                    responsesByActionId: responses.reduce((acc,response) => ({
                        ...acc,
                        [response.action_id]: response
                    }), {})
                } : {}
            ),
            ...(
                steps ? {steps} : {}
            )
        }
    }

    return getTreeObject(
        model,
        todo,
        nodesArray.slice(1),
        newTree
    )
}