import {Router} from "express";
import Step from "../models/Step";
import getStepForm from "../forms/getStepForm";
import update from "../libs/crud/requests/update";
import stepAccessCheck from "../security/accessChecks/stepAccessCheck";
import deleteOne from "../libs/crud/requests/deleteOne";
import getStepMiddleWare from "../middleWare/getStepMiddleWare";
import stepAssociations from "./stepAssociations";

const router = Router();

router.patch("/:id", update(Step, getStepForm, stepAccessCheck));
router.delete("/:id", deleteOne(Step, stepAccessCheck));
router.use("/:step_id/folders", getStepMiddleWare(), stepAssociations("folder"))
router.use("/:step_id/todos", getStepMiddleWare(), stepAssociations("todo"))

export default router;