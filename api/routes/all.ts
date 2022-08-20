import {Router} from "express";
import model from "./model";

const router = Router();

router.use("/models", model);

export default router;