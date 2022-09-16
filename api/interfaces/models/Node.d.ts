import {
    BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, InferAttributes, Optional
} from "sequelize";
import Node from "../../models/Node";
import TodoModel from "../../models/TodoModel";
import Response from "../../models/Response";
import Step from "../../models/Step";

export interface INode {
    id: number;
    text: string;
    type: 'action'|'question';
    model_id: number;

    setParents: BelongsToManySetAssociationsMixin<Node, any>;
    addParent: BelongsToManyAddAssociationMixin<Node, any>;
    removeParent: BelongsToManyRemoveAssociationMixin<Node, any>;
    setChildren: BelongsToManySetAssociationsMixin<Node, any>;
    addChild: BelongsToManyAddAssociationMixin<Node, any>;
    removeChild: BelongsToManyRemoveAssociationMixin<Node, any>;
    setModel: BelongsToSetAssociationMixin<TodoModel, any>;
    setResponses: HasManySetAssociationsMixin<Response, any>;
    addResponse: HasManyAddAssociationMixin<Response, any>
}
export type INodeCreation = InferAttributes<Optional<INode, 'id'>>;

export interface NodeWithParents extends Node {
    parents: Node[]
}
export interface NodeWithChildren extends Node {
    children: Node[]
}
export interface NodeWithModel extends Node {
    model: TodoModel
}
export interface NodeWithResponses extends Node {
    responses: Response[]
}
export interface NodeWithRelatedResponses extends Node {
    related_responses: Response[]
}
export interface NodeWithSteps extends Node {
    steps: Step[]
}