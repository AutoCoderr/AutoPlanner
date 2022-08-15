import IAccessCheck from "../../../interfaces/crud/security/IAccessCheck";
import ICrudParams from "../../../interfaces/crud/ICrudParams";
import IGetAndCheckExistingResourceParams from "../../../interfaces/crud/IGetAndCheckExistingResourceParams";
import update from "./update";
import IFormGetter from "../../../interfaces/form/IFormGetter";

export default function put(model, formGetter: IFormGetter, accessCheck: IAccessCheck, params: ICrudParams&IGetAndCheckExistingResourceParams = {}) {
    return update(model, formGetter, null, accessCheck, params);
}