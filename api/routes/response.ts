import {Router} from "express";
import get from "../libs/crud/requests/get";
import Response from "../models/Response";
import responseAccessCheck from "../security/accessChecks/responseAccessCheck";
import {responseIncludeQuestion, responseIncludeQuestionAndAction} from "../includeConfigs/response";
import update from "../libs/crud/requests/update";
import getResponseForm from "../forms/getResponseForm";
import deleteOne from "../libs/crud/requests/deleteOne";

const router = Router();

router.get("/:id", get(Response, responseAccessCheck, {
    include: responseIncludeQuestionAndAction
}));

router.put("/:id", update(Response, getResponseForm, responseAccessCheck, {
    include: responseIncludeQuestion
}));

router.patch("/:id", update(Response, getResponseForm, responseAccessCheck, {
    include: responseIncludeQuestion
}));

router.delete("/:id", deleteOne(Response, responseAccessCheck, {
    include: responseIncludeQuestion
}));

export default router;