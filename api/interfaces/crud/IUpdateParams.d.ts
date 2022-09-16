import ICrudParams from "./ICrudParams";
import IForm from "../form/IForm";
import {Model} from "sequelize";

interface IUpdateParams<M extends Model> extends ICrudParams<M> {
    checkAllFieldsUnique?: boolean,
    fieldExtractor?: ((form: IForm<M>) => IForm<M>)
}

export default IUpdateParams;