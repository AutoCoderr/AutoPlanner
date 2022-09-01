import {findNodeChildren, findNodesWithoutParentsByModelId} from "../repositories/NodeRepository";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import {InferAttributes} from "sequelize";
import compileDataValues from "./compileDatavalues";

export default async function getTreeObject(
    model: TodoModel,
    children0: null|InferAttributes<Node>[] = null,
    parent: null|InferAttributes<Node> = null,
    data: {[id: string]: (InferAttributes<Node>&{parents: number[], children: number[]})} = {}) {

    const children = children0 === null ? await findNodesWithoutParentsByModelId(model.id) : children0;

    if (children.length === 0)
        return data;

    const child = children[0];

    const newData = {
        ...data,
        [child.id]: {
            ...(data[child.id]??compileDataValues(child)),
            parents: parent ?
                [...(data[child.id] ? data[child.id].parents??[] : []), parent.id] :
                (data[child.id] ? data[child.id].parents : undefined)
        },
        ...(
            parent ? {
              [parent.id]: {
                  ...data[parent.id],
                  children: [...(data[parent.id].children??[]), child.id]
              }
            } : {}
        )
    }

    const subChildren = await findNodeChildren(child.id);

    return getTreeObject(
        model,
        children.slice(1),
        parent,
        await getTreeObject(
            model,
            subChildren,
            child,
            newData
        )
    )
}