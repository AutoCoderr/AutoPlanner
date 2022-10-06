import {CreateOptions, InstanceUpdateOptions} from "sequelize";
import {Attributes} from "sequelize/types/model";
import Step from "../../models/Step";
import Todo from "../../models/Todo";
import calculSynchronizedTodoPercent from "./calculSynchronizedTodoPercent";

async function synchronizeStepTodo(step: Step, options: InstanceUpdateOptions<Attributes<Step>> | CreateOptions<Attributes<Step>>) {
    if (options.fields !== undefined && !options.fields.includes("percent"))
        return;

    const todo = await <Promise<Todo>>Todo.findOne({
        where: {
            id: step.todo_id
        }
    });

    if (!todo.percentSynchronized)
        return;

    const calculatedSynchronizedPercent = await calculSynchronizedTodoPercent(todo);
    if (calculatedSynchronizedPercent === null)
        return;

    todo.percent = calculatedSynchronizedPercent;
    await todo.save();
}

async function todoPercentSynchronized(todo: Todo, options: InstanceUpdateOptions<Attributes<Todo>>) {
    if (!options.fields?.includes("percentSynchronized") || !todo.percentSynchronized)
        return;

    const calculatedSynchronizedPercent = await calculSynchronizedTodoPercent(todo);
    if (calculatedSynchronizedPercent === null)
        return;

    todo.set("percent", calculatedSynchronizedPercent);
}


export default async function detectAndSynchronizeStepTodo() {
    await Todo.addHook("beforeUpdate", todoPercentSynchronized);

    await Step.addHook("afterUpdate", synchronizeStepTodo);
    await Step.addHook("afterCreate", synchronizeStepTodo);
    await Step.addHook("afterDestroy", synchronizeStepTodo);
}
