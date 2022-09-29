import middleWareGenerator from "../libs/crud/middleWareGenerator";
import stepAccessCheck from "../security/accessChecks/stepAccessCheck";
import Step from "../models/Step";
import {stepIncludeAssociatedFoldersAndTodos} from "../includeConfigs/step";

export default () => middleWareGenerator(Step, stepAccessCheck, "step", {
    include: stepIncludeAssociatedFoldersAndTodos
});