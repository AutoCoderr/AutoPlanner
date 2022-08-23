import ICrudParams from "./ICrudParams";
import IForm from "../form/IForm";

interface IUpdateParams extends ICrudParams {
    checkAllFieldsUnique?: boolean,
    fieldExtractor?: ((form: IForm) => IForm)
}

export default IUpdateParams;