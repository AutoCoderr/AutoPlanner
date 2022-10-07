import IFormGetter from "../interfaces/form/IFormGetter";
import formatNumber from "../asserts/format/formatNumber";
import boolean from "../asserts/boolean";
import formatInteger from "../asserts/format/formatInteger";
import percent from "../asserts/percent";
import priority from "../asserts/priority";
import datetime from "../asserts/datetime";
import formatDatetime from "../asserts/format/formatDatetime";
import Folder from "../models/Folder";
import folderAccessCheck from "../security/accessChecks/folderAccessCheck";
import {IFolderCreation} from "../interfaces/models/Folder";

const getFolderForm: IFormGetter<Folder,IFolderCreation> = (reqData, method, folder) => ({
    model: Folder,
    fields: {
        name: {
            msg: "Le nom doit faire entre 2 et 50 caractères",
            valid: (value) => value.length >= 2 && value.length <= 50,
            required: method !== "patch"
        },
        description: {
            msg: "La description doit faire entre 2 et 200 caractères",
            valid: value => value.length >= 2 && value.length <= 200,
            required: false
        },
        percent: {
            msg: "Vous devez rentrer un nombre entre 0 et 100",
            valid: percent,
            format: formatNumber,
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
            ],
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
    additionalFields: {
        percentSynchronized: (data) =>
            data.percentSynchronized ?? (
                (data.percent !== undefined || folder === null) ?
                    false : folder.percentSynchronized
            ),
        ...(
            method === "post" ? {
                user_id: () => reqData.user?.id,
                parent_id: () => reqData.folder?.id
            } : {}
        )
    }
})

export default getFolderForm;