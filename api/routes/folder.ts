import {Router} from "express";
import getAll from "../libs/crud/requests/getAll";
import {findFolders} from "../repositories/FolderRepository";
import post from "../libs/crud/requests/post";
import Folder from "../models/Folder";
import getFolderForm from "../forms/getFolderForm";
import get from "../libs/crud/requests/get";
import folderAccessCheck from "../security/accessChecks/folderAccessCheck";
import put from "../libs/crud/requests/put";
import deleteOne from "../libs/crud/requests/deleteOne";
import patch from "../libs/crud/requests/patch";
import extractFields from "../libs/form/extractFields";

const router = Router();

router.get("/", getAll(findFolders));

router.post("/", post(Folder, getFolderForm));

router.get("/:id", get(Folder, folderAccessCheck));

router.put("/:id", put(Folder, getFolderForm, folderAccessCheck));

for (const field of (['name','description','percent','percentSynchronized','priority','deadLine','parent_id'])) {
    router.patch("/:id/"+field, patch(Folder, getFolderForm, extractFields(field), folderAccessCheck));
}

router.delete("/:id", deleteOne(Folder, folderAccessCheck));

export default router;