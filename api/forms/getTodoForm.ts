import datetime from "../asserts/datetime";
import formatNumber from "../asserts/format/formatNumber";
import formatInteger from "../asserts/format/formatInteger";
import formatDatetime from "../asserts/format/formatDatetime";
import IFormGetter from "../interfaces/form/IFormGetter";
import percent from "../asserts/percent";
import priority from "../asserts/priority";
import Folder from "../models/Folder";
import folderAccessCheck from "../security/accessChecks/folderAccessCheck";
import Todo from "../models/Todo";
import TodoModel from "../models/TodoModel";
import modelAccessCheck from "../security/accessChecks/modelAccessCheck";
import createFirstStepOnTodo from "../libs/createFirstStepOnTodo";
import boolean from "../asserts/boolean";
import {ITodoCreation} from "../interfaces/models/Todo";

const getTodoForm: IFormGetter<Todo,ITodoCreation> = (reqData, method, todo) => ({
    model: Todo,
    fields: {
        name: {
            msg: "Le nom doit faire entre 2 et 50 caractères",
            valid: value => 2 <= value.length && value.length <= 50,
            required: method !== "patch"
        },
        description: {
            msg: "Le description doit faire entre 2 et 200 caractères",
            valid: value => 2 <= value.length && value.length <= 200,
            required: false
        },
        percent: {
            msg: "Vous devez rentrer un nombre entre 0 et 100",
            valid: percent,
            format: formatNumber,
            required: false
        },
        priority: {
            msg: "Vous devez rentrer un entier entre 1 et 5",
            valid: priority,
            format: formatInteger,
            required: false
        },
        deadLine: {
            msg: "Vous avez rentré une date invalide",
            valid: datetime,
            format: formatDatetime,
            required: false
        },
        parent_id: {
            msg: "Dossier parent mal mentionné",
            model: Folder,
            valid: (folder: Folder) => folderAccessCheck(folder, "update", reqData.user),
            format: (folder: Folder) => folder.id,
            required: false
        },
        model_id: {
            msg: "Vous n'avez pas accès à ce modèle",
            model: TodoModel,
            valid: (model: TodoModel) => modelAccessCheck(model, "get", reqData.user),
            format: (model: TodoModel) => model.id,
            required: false
        },
        percentSynchronized: {
            msg: "Vous devez rentrer un booléen",
            valid: boolean,
            otherValidates: [
                {
                    msg: "Vous ne pouvez pas en même temps synchroniser les pourcentages et en définir un vous même",
                    valid: (percentSynchronized: boolean, data) =>
                        !percentSynchronized ||
                        data.percent === undefined
                },
                {
                    msg: "Vous ne pouvez pas synchroniser les pourcentages d'une todo sans modèle",
                    valid: (percentSynchronized: boolean, data) =>
                        !percentSynchronized ||
                        ( data.model_id !== undefined && data.model_id !== null ) ||
                        ( data.model_id === undefined && todo !== null && todo.model_id !== null)

                }
            ],
            required: false,
        }
    },
    additionalFields: {
        percentSynchronized: (data) =>
            data.percentSynchronized ?? ((
                data.model_id === null ||
                (data.model_id === undefined && (todo === null || todo.model_id === null)) ||
                data.percent !== undefined ||
                todo === null
            ) ? false : todo.percentSynchronized ),
        ...(
            method === "post" ? {
                user_id: () => reqData.user?.id,
                parent_id: () => reqData.folder?.id
            } : {}
        )
    },


    onCreated: createFirstStepOnTodo
})

export default getTodoForm;