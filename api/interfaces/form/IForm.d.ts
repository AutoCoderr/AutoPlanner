import IFields from "./IFields";
import IAdditionalFields from "./IAdditionalFields";
import allModelsTypes from "../allModelsType";

interface IForm {
    model: allModelsTypes
    fields: IFields,
    additionalFields?: IAdditionalFields
}

export default IForm;