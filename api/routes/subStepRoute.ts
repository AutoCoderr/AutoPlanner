import {Router} from "express";
import post from "../libs/crud/requests/post";
import Step from "../models/Step";
import getStepForm from "../forms/getStepForm";
import stepCreateAccessCheck from "../security/createAccessChecks/stepCreateAccessCheck";

const router = Router();

router.post("/", post(Step, getStepForm, stepCreateAccessCheck, {
    forbiddenCode: 404
}));

export default router;