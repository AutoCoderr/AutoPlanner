import {NodeWithModel} from "../interfaces/models/Node";
import {findNodeChildren, findNodeParents} from "../repositories/NodeRepository";
import {nodeIncludeModel} from "../includeConfigs/node";

export default async function deleteChildrenRecursively(children: NodeWithModel[]) {
    for (const child of children) {
        if (child.id === child.model.firstnode_id)
            continue;

        const parents = await findNodeParents(child.id);
        if (parents.length > 0)
            continue;

        await child.destroy();
        const subChildren = await <Promise<NodeWithModel[]>>findNodeChildren(child.id, nodeIncludeModel);
        await deleteChildrenRecursively(subChildren);
    }
}