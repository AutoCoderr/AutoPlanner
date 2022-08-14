import number from "../asserts/number";
import integer from "../asserts/integer";
import datetime from "../asserts/datetime";
import formatNumber from "../asserts/format/formatNumber";
import formatInteger from "../asserts/format/formatInteger";
import formatDatetime from "../asserts/format/formatDatetime";
import IReqData from "../interfaces/form/IReqData";
import IFormGetter from "../interfaces/form/IFormGetter";

const getTodoForm: IFormGetter = (reqData: IReqData) => ({
    fields: {
        name: {
            msg: "Le nom doit faire entre 2 et 50 caractères",
            valid: value => 2 <= value.length && value.length <= 50,
            required: true
        },
        description: {
            msg: "Le description doit faire entre 2 et 200 caractères",
            valid: value => 2 <= value.length && value.length <= 200,
            required: false
        },
        percent: {
            msg: "Valeur invalide",
            valid: number,
            format: formatNumber,
            required: false
        },
        priority: {
            msg: "Valeur invalide",
            valid: (value) => integer(value) && parseInt(value) >= 1,
            format: formatInteger,
            required: false
        },
        deadLine: {
            msg: "Vous avez rentré une date invalide",
            valid: datetime,
            format: formatDatetime,
            required: false
        }
    },
    additionalFields: {
        user_id: () => reqData.user?.id,
    }
})

export default getTodoForm;