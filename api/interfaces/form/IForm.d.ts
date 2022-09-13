import IFields from "./IFields";
import IAdditionalFields from "./IAdditionalFields";
import allModelsTypes from "../allModelsType";
import {ModelStatic} from "sequelize/types/model";
import {Model} from "sequelize";
import IReqData from "../IReqData";

interface IForm<M extends Model,IData = any> {
    model: ModelStatic<M>
    fields: IFields<IData>,
    additionalFields?: IAdditionalFields<IData>,
    onCreated?: (createdElem: M, validatedData: IData) => any,
    onUpdated?: (updatedElem: M, validatedData: IData) => any
}

export default IForm;