import IForm from "./IForm";

type IExtractFields = (...fields: string[]) => (form: IForm<any>) => IForm<any>;

export default IExtractFields;