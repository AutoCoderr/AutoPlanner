import {Router} from "express";
import getAll from "../libs/crud/requests/getAll";
import {findFolders} from "../repositories/FolderRepository";
import post from "../libs/crud/requests/post";
import Folder from "../models/Folder";
import getFolderForm from "../forms/getFolderForm";
import get from "../libs/crud/requests/get";
import folderAccessCheck from "../security/accessChecks/folderAccessCheck";
import deleteOne from "../libs/crud/requests/deleteOne";
import extractFields from "../libs/form/extractFields";
import update from "../libs/crud/requests/update";

const router = Router();

router.get("/", getAll(findFolders));

router.post("/", post(Folder, getFolderForm));

router.get("/:id", get(Folder, folderAccessCheck));

router.put("/:id", update(Folder, getFolderForm, folderAccessCheck));

for (const field of (['name','description','percent','percentSynchronized','priority','deadLine','parent_id'])) {
    router.patch("/:id/"+field, update(Folder, getFolderForm, folderAccessCheck, extractFields(field)));
}

router.delete("/:id", deleteOne(Folder, folderAccessCheck));

export default router;