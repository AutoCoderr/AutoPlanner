import Todo from "../../models/Todo";
import Folder from "../../models/Folder";
import {InstanceUpdateOptions} from "sequelize";
import {Attributes} from "sequelize/types/model";
import {findAssociatedStepsByFolderId, findAssociatedStepsByTodoId} from "../../repositories/StepRepository";
import calculSynchronizedStepPercent from "./calculSynchronizedStepPercent";
import Step from "../../models/Step";

async function synchronizeTodoAndFolderAssociatedSteps<M extends Todo | Folder>(todoOrFolder: M, options: InstanceUpdateOptions<Attributes<M>>, type: 'todo'|'folder') {
    if (options.fields !== undefined && !options.fields.includes("percent"))
        return;

    const associatedSteps = type === 'todo' ?
        await findAssociatedStepsByTodoId(todoOrFolder.id) :
        await findAssociatedStepsByFolderId(todoOrFolder.id);

    await Promise.all(
        associatedSteps.map(async associatedStep => {
            if (!associatedStep.percentSynchronized)
                return;
            const calculatedSynchronizedPercent: null|number = await calculSynchronizedStepPercent(associatedStep);
            if (calculatedSynchronizedPercent === null)
                return;
            associatedStep.percent = calculatedSynchronizedPercent;
            return associatedStep.save();
        })
    )
}

async function stepPercentSynchronized(step: Step, options: InstanceUpdateOptions<Attributes<Step>>) {
    if (!options.fields?.includes("percentSynchronized") || !step.percentSynchronized)
        return;

    const calculatedSynchronizedPercent: null|number = await calculSynchronizedStepPercent(step);
    if (calculatedSynchronizedPercent === null)
        return;
    step.set('percent', calculatedSynchronizedPercent);
}

export default async function detectAndSynchronizeSteps() {
    await Step.addHook("beforeUpdate", (step, options) => stepPercentSynchronized(<Step>step, options))

    await Todo.addHook("afterUpdate", (todo, options) => synchronizeTodoAndFolderAssociatedSteps(<Todo>todo, options, 'todo'));
    await Folder.addHook("afterUpdate", (folder, options) => synchronizeTodoAndFolderAssociatedSteps(<Folder>folder, options, 'folder'));

    await Todo.addHook("afterDestroy", (todo, options) => synchronizeTodoAndFolderAssociatedSteps(<Todo>todo, options, 'todo'));
    await Folder.addHook("afterDestroy", (folder, options) => synchronizeTodoAndFolderAssociatedSteps(<Folder>folder, options, 'folder'));
}