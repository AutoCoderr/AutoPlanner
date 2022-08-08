import Step from "../models/Step";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import compileDataValues from "../libs/compileDatavalues";
import {IStepWithAssociatedFolders, IStepWithAssociatedTodos} from "../interfaces/Step";

export function findOneStepByIdWithAssociatedTodosAndFolders(id: number): Promise<null|IStepWithAssociatedTodos&IStepWithAssociatedFolders> {
    return <Promise<null|IStepWithAssociatedTodos&IStepWithAssociatedFolders>>Step.findOne({
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