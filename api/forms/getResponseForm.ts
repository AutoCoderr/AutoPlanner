import IFormGetter from "../interfaces/form/IFormGetter";
import Response from "../models/Response";
import { nodeIncludeModelAndParents} from "../includeConfigs/node";
import {NodeWithModel, NodeWithParents} from "../interfaces/models/Node";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import Node from "../models/Node";

const getResponseForm: IFormGetter = function(reqData, mode)  {
    return {
        model: Response,
        fields: {
            text: {
                msg: "Le texte doit faire entre 2 et 140 caractères",
                valid: value => value.length >= 2 && value.length <= 140,
                required: mode !== "patch",
            },
            action_id: {
                model: Node,
                msg: "Vous ne pouvez pas ajouter de réponse à ce noeud",
                include: nodeIncludeModelAndParents,
                valid: (action: NodeWithModel&NodeWithParents) => reqData.node !== undefined &&
                    nodeAccessCheck(action, "update", reqData.user) &&
                    action.model_id === reqData.node.model_id &&
                    action.parents.some(parent => parent.id === reqData.node?.id),
                format: (action: Node) => action.id,
                required: mode === "post"
            }
        },
        additionalFields: mode === "post" ? {
            question_id: () => reqData.node?.id
        } : undefined
    }
}

export default getResponseForm;