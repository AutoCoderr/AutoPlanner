import {Includeable} from "sequelize/types/model";
import Step from "../models/Step";

export const folderIncludeAssociatedSteps: Includeable = {
    model: Step,
    as: "associatedSteps"
}