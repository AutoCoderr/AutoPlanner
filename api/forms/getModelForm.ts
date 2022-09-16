import IFormGetter from "../interfaces/form/IFormGetter";
import boolean from "../asserts/boolean";
import {Op} from "sequelize";
import TodoModel from "../models/TodoModel";
import canModelBePublished from "../libs/canModelBePublished";
import Node from "../models/Node";

const getModelForm: IFormGetter<TodoModel> = function (reqData, method, elem) {
    return {
        model: TodoModel,
        fields: {
            ...((method !== "post" && elem !== null) ? {
                published: {
                    msg: "Vous devez rentrer un booléen",
                    valid: boolean,
                    otherValidates: [
                        {
                            msg: "Vous ne pouvez pas encore publier ce modèle",
                            valid: () => canModelBePublished(elem)
                        }
                    ],
                    required: method === "put"
                }
            }: {}),
            name: {
                msg: "Le nom doit faire entre 2 et 50 caractères",
                valid: value => value.length >= 2 && value.length <= 50,
                required: method !== "patch",
                unique: ({published}) => (
                    {
                        where: published === true ? {
                            [Op.or]: [
                                { user_id: reqData.user?.id },
                                { published: true }
                            ]
                        } : {
                            user_id: reqData.user?.id,
                        }
                    }),
                uniqueMsg: ({published}) => published === true ?
                    "Le nom de ce modèle est déjà pris, vous devez le changer" :
                    "Vous possédez déjà un modèle avec ce nom"
            },
            description: {
                msg: "La description doit faire entre 2 et 200 caractères",
                valid: value => value.length >= 2 && value.length <= 200,
                required: false
            }
        },
        additionalFields: method === "post" ? {
            user_id: () => reqData.user?.id
        } : undefined,
        async onCreated(model) {
            const firstnode = await Node.create({
                text: "Premier noeud (n'hésite pas à me modifier !)",
                type: "action",
                model_id: model.id
            });
            model.firstnode_id = firstnode.id;
            await model.save();
        }
    }
}

export default getModelForm;