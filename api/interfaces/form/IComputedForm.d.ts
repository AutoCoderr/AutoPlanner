import IViolation from "./IViolations";
import {Model} from "sequelize";

type IComputedForm<M extends Model,IData = any> = Promise<
    {computedData: M['_creationAttributes'], validatedData: IData, violations: null} |
    {violations: IViolation[], validatedData: null, computedData: null}>;

export default IComputedForm;