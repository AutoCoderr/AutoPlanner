import {Router} from "express";
import post from "../libs/crud/requests/post";
import Step from "../models/Step";
import getStepForm from "../forms/getStepForm";
import update from "../libs/crud/requests/update";
import stepAccessCheck from "../security/accessChecks/stepAccessCheck";
import {stepWithNodeAndTodo} from "../includeConfigs/step";
import deleteOne from "../libs/crud/requests/deleteOne";

const router = Router();

router.post("/", post(Step, getStepForm))
router.patch("/:id", update(Step, getStepForm, stepAccessCheck, {
    include: stepWithNodeAndTodo
}))
router.delete("/:id", deleteOne(Step, stepAccessCheck))

export default router;