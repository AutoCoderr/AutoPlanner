import Node from "../../models/Node";
import expectElem from "./expectElem";
import compileDataValues from "../compileDatavalues";
import TodoModel from "../../models/TodoModel";
import Todo from "../../models/Todo";

export default function testTree(
    res: any,
    model: TodoModel,
    nodes: Node[],
    childrenByParentId: {[id: string]: number[]},
    parentsByChildId: {[id: string]: number[]},
    responsesByQuestionAndActionId: {[id: string]: {[action_id: string]: {[key: string]: any}}},
    stepsByNodeId: null|{[id: string]: {[key: string]: any}[]} = null,
    todo: null|Todo = null
) {
    return expectElem({
        res,
        code: 200,
        checkDbElem: false,
        toCheck: {
            model: {
                ...compileDataValues(model),
                createdAt: model.createdAt.toISOString(),
                updatedAt: model.updatedAt.toISOString()
            },
            ...(
                todo ? {
                    todo: {
                        ...compileDataValues(todo),
                        createdAt: todo.createdAt.toISOString(),
                        updatedAt: todo.updatedAt.toISOString()
                    }
                } : {}
            ),
            tree: nodes.reduce((acc, node) => ({
                ...acc,
                [node.id]: {
                    ...compileDataValues(node),
                    children: childrenByParentId[node.id]??[],
                    parents: parentsByChildId[node.id]??[],
                    ...(responsesByQuestionAndActionId[node.id] ?
                            {
                                responsesByActionId: responsesByQuestionAndActionId[node.id]
                            } : {}
                    ),
                    ...((stepsByNodeId && stepsByNodeId[node.id]) ?
                            {
                                steps: stepsByNodeId[node.id].map(response => ({
                                    ...response,
                                    createdAt: response.createdAt.toISOString(),
                                    updatedAt: response.updatedAt.toISOString()
                                }))
                            } : {}
                    )
                },
            }), {}),
        }
    })
}