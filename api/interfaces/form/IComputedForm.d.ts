import IViolation from "./IViolations";

type IComputedForm = Promise<
    {computedData: {[key: string]: string}, violations: null} |
    {violations: IViolation[], computedData: null}>;

export default IComputedForm;