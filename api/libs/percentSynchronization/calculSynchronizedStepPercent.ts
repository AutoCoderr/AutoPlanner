import Step from "../../models/Step";
import {findAssociatedTodosByStep} from "../../repositories/TodoRepository";
import {findAssociatedFoldersByStep} from "../../repositories/FolderRepository";
import round from "../round";

export default async function calculSynchronizedStepPercent(step: Step): Promise<null|number> {
    if (!step.percentSynchronized)
        return null;

    const associatedTodos = await findAssociatedTodosByStep(step);
    const associatedFolders = await findAssociatedFoldersByStep(step);

    return round(
            (
                [...associatedTodos, ...associatedFolders]
                    .reduce((acc,todoOrFolder) => acc+todoOrFolder.percent, 0) /
                (( associatedTodos.length + associatedFolders.length ) * 100)
            ) * 100
        , 3);
}