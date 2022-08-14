import IForm from "./IForm";

type IExtractFields = (...fields: string[]) => (form: IForm) => IForm;

export default IExtractFields;