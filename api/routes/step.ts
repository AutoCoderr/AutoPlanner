import {Router} from "express";
import Step from "../models/Step";
import getStepForm from "../forms/getStepForm";
import update from "../libs/crud/requests/update";
import stepAccessCheck from "../security/accessChecks/stepAccessCheck";
import deleteOne from "../libs/crud/requests/deleteOne";

const router = Router();

router.patch("/:id", update(Step, getStepForm, stepAccessCheck));
router.delete("/:id", deleteOne(Step, stepAccessCheck));

export default router;