import IFields from "./IFields";
import IAdditionalFields from "./IAdditionalFields";

interface IForm {
    fields: IFields,
    additionalFields?: IAdditionalFields
}

export default IForm;