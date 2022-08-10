import Step from "../models/Step";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import compileDataValues from "../libs/compileDatavalues";
import {StepWithAssociatedFolders, StepWithAssociatedTodos} from "../interfaces/models/Step";

export function findOneStepByIdWithAssociatedTodosAndFolders(id: number): Promise<null|StepWithAssociatedTodos&StepWithAssociatedFolders> {
    return <Promise<null|StepWithAssociatedTodos&StepWithAssociatedFolders>>Step.findOne({
        where: { id },
        include: [
            {
                model: Todo,
                as: "associatedTodos"
            },
            {
                model: Folder,
                as: "associatedFolders"
            }
        ]
    }).then(res => compileDataValues(res))
}