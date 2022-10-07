import {CreateOptions, InferAttributes, InstanceUpdateOptions, Model} from "sequelize";
import Todo from "../../models/Todo";
import Folder from "../../models/Folder";
import {Attributes} from "sequelize/types/model";
import calculSynchronizedFolderPercent from "./calculSynchronizedFolderPercent";
import {ITodoCreation, TodoWithPreviousDataValues} from "../../interfaces/models/Todo";
import {FolderWithPreviousDataValues, IFolderCreation} from "../../interfaces/models/Folder";

async function synchronizeTodoAndFolderParent<M extends TodoWithPreviousDataValues | FolderWithPreviousDataValues>(todoOrFolder: M, options: InstanceUpdateOptions<Attributes<M>> | CreateOptions<Attributes<M>>) {
    if ((options.fields !== undefined && !options.fields.includes("percent") && !options.fields.includes("parent_id")))
        return;

    const parent = todoOrFolder.parent_id !== null  ? await Folder.findOne({
        where: {
            id: todoOrFolder.parent_id
        }
    }) : null
    const previousParent = (
                todoOrFolder._previousDataValues.parent_id &&
                todoOrFolder._previousDataValues.parent_id !== todoOrFolder.parent_id
            ) ? await Folder.findOne({
                    where: {
                        id: todoOrFolder._previousDataValues.parent_id
                    }
                }) : null

    if (parent && parent.percentSynchronized) {
        const calculatedSynchronizedPercent: null | number = await calculSynchronizedFolderPercent(parent);
        if (calculatedSynchronizedPercent === null)
            return;

        parent.percent = calculatedSynchronizedPercent;
        await parent.save();
    }

    if (previousParent && previousParent.percentSynchronized) {
        const calculatedSynchronizedPercent: null | number = await calculSynchronizedFolderPercent(previousParent);
        if (calculatedSynchronizedPercent === null)
            return;

        previousParent.percent = calculatedSynchronizedPercent;
        await previousParent.save();
    }
}

async function folderPercentSynchronized(folder: Folder, options: InstanceUpdateOptions<Attributes<Folder>>) {
    if (!options.fields?.includes("percentSynchronized") || !folder.percentSynchronized)
        return;

    const calculatedSynchronizedPercent: null|number = await calculSynchronizedFolderPercent(folder);

    if (calculatedSynchronizedPercent === null)
        return;
    folder.set("percent", calculatedSynchronizedPercent);
}

export default async function detectAndSynchronizeTodoAndFolderParent() {
    await Folder.addHook("beforeUpdate", folderPercentSynchronized);

    await Folder.addHook("afterUpdate", (folder, options) => synchronizeTodoAndFolderParent(<FolderWithPreviousDataValues>folder, options));
    await Todo.addHook("afterUpdate", (todo, options) => synchronizeTodoAndFolderParent(<TodoWithPreviousDataValues>todo, options));

    await Folder.addHook("afterCreate", (folder, options) => synchronizeTodoAndFolderParent(<FolderWithPreviousDataValues>folder, options));
    await Todo.addHook("afterCreate", (todo, options) => synchronizeTodoAndFolderParent(<TodoWithPreviousDataValues>todo, options));

    await Folder.addHook("afterDestroy", (folder, options) => synchronizeTodoAndFolderParent(<FolderWithPreviousDataValues>folder, options));
    await Todo.addHook("afterDestroy", (todo, options) => synchronizeTodoAndFolderParent(<TodoWithPreviousDataValues>todo, options));
}