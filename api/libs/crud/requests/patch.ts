import IAccessCheck from "../../../interfaces/crud/security/IAccessCheck";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import IForm from "../../../interfaces/form/IForm";
import update from "./update";
import IFormGetter from "../../../interfaces/form/IFormGetter";

export default function patch(model, formGetter: IFormGetter, fieldExtractor: (form: IForm) => IForm, accessCheck: IAccessCheck, params: ICrudParams&IGetAndCheckExistingResourceParams = {}) {
    return update(model, formGetter, fieldExtractor, accessCheck, params);
}