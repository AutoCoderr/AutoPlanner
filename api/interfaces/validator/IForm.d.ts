import {IUserConnected} from "../models/User";
import IField from "./IField";

interface IForm {
    fields: {
        [key: string]: IField
    },
    additionalFields?: {
        [key: string]: (data: {[key: string]: any}, connectedUser: undefined|IUserConnected) => Promise<any>|any
    }
}

export default IForm;