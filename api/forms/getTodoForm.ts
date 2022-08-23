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

const getTodoForm: IFormGetter = (reqData, method) => ({
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
        }
    },
    additionalFields: method === "post" ? {
        user_id: () => reqData.user?.id,
        parent_id: () => reqData.folder?.id
    } : undefined
})

export default getTodoForm;