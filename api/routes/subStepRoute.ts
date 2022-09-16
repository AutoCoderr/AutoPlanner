import {Router} from "express";
import post from "../libs/crud/requests/post";
import Step from "../models/Step";
import getStepForm from "../forms/getStepForm";

const router = Router();

router.post("/", post(Step, getStepForm));

export default router;