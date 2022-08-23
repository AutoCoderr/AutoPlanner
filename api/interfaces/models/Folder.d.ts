import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin,
    HasManyAddAssociationMixin, InferAttributes, Optional
} from "sequelize";
import Folder from "../../models/Folder";
import Todo from "../../models/Todo";
import Step from "../../models/Step";
import User from "../../models/User";

export interface IFolder {
    id: number;
    name: string;
    description?: string;
    percent: number;
    percentSynchronized: boolean;
    deadLine?: Date;
    priority: number;
    parent_id?: number|null;
    user_id: number;

    createdAt: Date;
    updatedAt: Date;

    setParent: BelongsToSetAssociationMixin<Folder, any>;
    addFolder: HasManyAddAssociationMixin<Folder, any>;
    addTodo: HasManyAddAssociationMixin<Todo, any>;
    setAssociatedSteps: BelongsToManySetAssociationsMixin<Step, any>;
    addAssociatedStep: BelongsToManyAddAssociationMixin<Step, any>;
    setUser: BelongsToSetAssociationMixin<User, any>;
}
export type IFolderCreation = InferAttributes<Optional<IFolder, 'id' | 'description' | 'percent' | 'percentSynchronized' | 'priority' | 'parent_id' | 'deadLine' | 'createdAt' | 'updatedAt'>>;

export interface FolderWithParent extends Folder {
    parent: null|IFolder
}
export interface FolderWithFolders extends Folder {
    folders: Folder[]
}
export interface FolderWithTodos extends Folder {
    todos: Todo[]
}
export interface FolderWithAssociatedSteps extends Folder {
    associatedSteps: Step[]
}
export interface FolderWithUser extends Folder {
    user: User
}