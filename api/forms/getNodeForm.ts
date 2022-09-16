import IFormGetter from "../interfaces/form/IFormGetter";
import Node from "../models/Node";
import {findNodeChildren} from "../repositories/NodeRepository";

const getNodeForm: IFormGetter<Node> =
        (reqData, mode, node) => ({
            model: Node,
            fields: {
                text: {
                    msg: "Le texte doit faire entre 2 et 150 caractères",
                    valid: value => value.length >= 2 && value.length <= 150,
                    required: mode !== "patch",
                },
                type: {
                    msg: "Le type ne peut être que 'question' ou 'action'",
                    valid: value => ['question', 'action'].includes(value),
                    otherValidates: [
                        {
                            msg: "Vous ne pouvez pas transformer cette question en action si elle contient plusieurs enfants",
                            valid: async value => {
                                if (node === null)
                                    return true;
                                if (value === "question")
                                    return true;

                                const children = await findNodeChildren(node.id)
                                return children.length <= 1;
                            }
                        }
                    ],
                    required: mode !== "patch"
                }
            },
            additionalFields: mode === "post" ? {
                model_id: () => reqData.node ? reqData.node.model.id : reqData.model?.id
            } : undefined,

            onCreated(createdNode) {
                if (reqData.node === undefined)
                    return;

                return reqData.node.addChild(createdNode);
            }
        })

export default getNodeForm;
