import {Router} from "express";
import getReqData from "../libs/crud/getReqData";
import getAndCheckExistingResource from "../libs/crud/getAndCheckExistingResource";
import folderAccessCheck from "../security/accessChecks/folderAccessCheck";
import folderChildrenSome from "../libs/folderChildrenSome";
import Folder from "../models/Folder";
import IReqData from "../interfaces/IReqData";
import Todo from "../models/Todo";
import todoAccessCheck from "../security/accessChecks/todoAccessCheck";
import getAll from "../libs/crud/requests/getAll";
import {findAssociatedFoldersByStep} from "../repositories/FolderRepository";
import {findAssociatedTodosByStep} from "../repositories/TodoRepository";
import Step from "../models/Step";
import {findAssociatedStepsByFolder, findAssociatedStepsByTodo} from "../repositories/StepRepository";

async function getElement(reqData: IReqData, req, type: 'folder'|'todo'): Promise<{ elem: Folder | Todo | null, code: number | null }> {
    if (reqData.step === undefined)
        return {elem: null, code: 400};

    return getAndCheckExistingResource<Folder | Todo>(
            type === 'folder' ? Folder : Todo,
            req,
            "get",
            type === 'folder' ? folderAccessCheck : todoAccessCheck,
            reqData.user);
}


async function detectAssociationLoop(initialTodoOrFolder: Todo|Folder, currentNode: Todo|Folder|Step) {
    if (initialTodoOrFolder.constructor.name === currentNode.constructor.name && initialTodoOrFolder.id === currentNode.id)
        return true;

    const parent = ((currentNode instanceof Folder || currentNode instanceof Todo) && currentNode.parent_id !== null) ?
        await Folder.findOne({
            where: {id: currentNode.parent_id}
        }) :
        currentNode instanceof Step ?
            await Todo.findOne({
                where: {
                    id: currentNode.todo_id
                }
            }) : null

    const associatedParents = currentNode instanceof Todo ?
        await findAssociatedStepsByTodo(currentNode) :
        currentNode instanceof Folder ?
            await findAssociatedStepsByFolder(currentNode) :
            null

    if (parent !== null && await detectAssociationLoop(initialTodoOrFolder, parent))
        return true;

    if (associatedParents !== null)
        for (const associatedParent of associatedParents)
            if (await detectAssociationLoop(initialTodoOrFolder, associatedParent))
                return true;

    return false;
}

async function addAssociation(reqData: IReqData, req, type: 'folder'|'todo'): Promise<number> {
    if (reqData.step === undefined)
        return 400;

    const {elem, code} = await getElement(reqData,req,type);

    if (!elem)
        return <number>code;

    if (
        await detectAssociationLoop(elem, reqData.step) ||
        reqData.step[type === 'folder' ? 'associatedFolders' : 'associatedTodos'].some(todoOrFolder => todoOrFolder.id === elem.id)
    )
        return 409;

    if (
        elem instanceof Folder &&
        await folderChildrenSome(elem, (todoOrFolder) =>
            reqData.step !== undefined && (
                    (
                        todoOrFolder instanceof Folder &&
                        reqData.step.associatedFolders.some(associatedFolder => associatedFolder.id === todoOrFolder.id)
                    ) ||
                    (
                        todoOrFolder instanceof Todo &&
                        reqData.step.associatedTodos.some(associatedTodo => associatedTodo.id === todoOrFolder.id)
                    )
                )
            , 'both')
    )
        return 409;

    for (const folder of reqData.step.associatedFolders) {
        if (await folderChildrenSome(folder, (todoOrFolder) => todoOrFolder.id === elem.id, type))
            return 409;
    }


    await elem.addAssociatedStep(reqData.step);

    return 201
}

async function deleteAssociation(reqData: IReqData, req, type: 'folder'|'todo'): Promise<number> {
    if (reqData.step === undefined)
        return 400;

    const {elem, code} = await getElement(reqData,req,type);

    if (!elem)
        return <number>code;

    if (!reqData.step[type === 'folder' ? 'associatedFolders' : 'associatedTodos'].some(todoOrFolder => todoOrFolder.id === elem.id))
        return 404;

    await elem.removeAssociatedStep(reqData.step);
    return 204;
}

export default function stepAssociations(type: 'folder'|'todo') {
    const router = Router();

    router.post("/:id", (req, res) => addAssociation(getReqData(req), req, type).then(code => res.sendStatus(code)));
    router.delete("/:id", (req, res) => deleteAssociation(getReqData(req), req, type).then(code => res.sendStatus(code)));
    router.get("/", getAll(type === 'folder' ? findAssociatedFoldersByStep : findAssociatedTodosByStep))

    return router;
}