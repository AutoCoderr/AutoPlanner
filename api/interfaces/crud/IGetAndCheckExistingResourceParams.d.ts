import {Includeable} from "sequelize/types/model";
import IAccessCheck from "./security/IAccessCheck";

interface IGetAndCheckExistingResourceParams<IM> {
    notFoundCode?: number;
    notFoundFromGetterCode?: number;
    forbiddenCode?: number;
    include?: Includeable | Includeable[];
    getter?: (elem: IM) => any|Promise<elem>;
    gettedAccessCheck?: IAccessCheck
}

export default IGetAndCheckExistingResourceParams;