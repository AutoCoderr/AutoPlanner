import {Router} from "express";
import getAll from "../libs/crud/requests/getAll";
import {findResponses} from "../repositories/ResponseRepository";
import responseGetAllAccessCheck from "../security/getAllAccessChecks/responseGetAllAccessCheck";
import post from "../libs/crud/requests/post";
import Response from "../models/Response";
import getResponseForm from "../forms/getResponseForm";
import responseCreateAccessCheck from "../security/createAccessChecks/responseCreateAccessCheck";

const router = Router();

router.get("/", getAll(findResponses, responseGetAllAccessCheck, {
    forbiddenCode: 404
}));

router.post("/", post(Response, getResponseForm, responseCreateAccessCheck, {
    forbiddenCode: 404
}));

export default router;