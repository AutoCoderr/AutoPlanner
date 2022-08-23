import {Includeable} from "sequelize/types/model";
import IAccessCheck from "./security/IAccessCheck";

interface IGetAndCheckExistingResourceParams {
    notFoundCode?: number;
    forbiddenCode?: number;
    include?: Includeable | Includeable[];
    getter?: (elem: any) => any;
    gettedAccessCheck?: IAccessCheck
}

export default IGetAndCheckExistingResourceParams;