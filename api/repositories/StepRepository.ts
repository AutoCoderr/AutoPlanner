import Step from "../models/Step";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import {StepWithAssociatedFolders, StepWithAssociatedTodos} from "../interfaces/models/Step";
import RelationStepTodo from "../models/RelationStepTodo";
import {Op} from "sequelize";
import RelationStepFolder from "../models/RelationStepFolder";

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
    })
}

export function findAssociatedStepsByTodo(todo: Todo) {
    return RelationStepTodo.findAll({
        where: {
            todo_id: todo.id
        }
    })
        .then(relations => relations.map(({step_id}) => step_id))
        .then(stepIds =>
            Step.findAll({
                where: {
                    id: {[Op.in]: stepIds}
                }
            })
        )
}

export function findAssociatedStepsByFolder(folder: Folder) {
    return RelationStepFolder.findAll({
        where: {
            folder_id: folder.id
        }
    })
        .then(relations => relations.map(({step_id}) => step_id))
        .then(stepIds =>
            Step.findAll({
                where: {
                    id: {[Op.in]: stepIds}
                }
            })
        )
}