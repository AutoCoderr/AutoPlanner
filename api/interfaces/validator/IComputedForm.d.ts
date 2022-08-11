import IViolation from "./IViolations";

type IComputedForm = Promise<{success: true, computedData: {[key: string]: string}, violations: null}|{success: false, violations: IViolation[], computedData: null}>;

export default IComputedForm;