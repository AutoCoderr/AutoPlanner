import IFormGetter from "../interfaces/form/IFormGetter";
import Node from "../models/Node";

const getNodeForm: IFormGetter = function(reqData, mode)  {
    return {
        model: Node,
        fields: {
            text: {
                msg: "Le texte doit faire entre 2 et 150 caractères",
                valid: value => value.length >= 2 && value.length <= 150,
                required: mode !== "patch",

            },
            type: {
                msg: "Le type ne peut être que 'question' ou 'action'",
                valid: value => ['question','action'].includes(value),
                required: mode !== "patch"
            }
        },
        additionalFields: mode === "post" ? {
            model_id: () => reqData.node ? reqData.node.model.id : reqData.model?.id
        } : undefined
    }
}

export default getNodeForm;
