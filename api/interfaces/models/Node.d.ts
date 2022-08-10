import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, Optional
} from "sequelize";
import Node from "../../models/Node";
import TodoModel from "../../models/TodoModel";
import Response from "../../models/Response";

export interface INode {
    id: number;
    text: string;
    type: 'action'|'question';
    model_id: number;

    setParents: BelongsToManySetAssociationsMixin<Node, any>;
    addParent: BelongsToManyAddAssociationMixin<Node, any>;
    setChildren: BelongsToManySetAssociationsMixin<Node, any>;
    addChild: BelongsToManyAddAssociationMixin<Node, any>;
    setModel: BelongsToSetAssociationMixin<TodoModel, any>;
    setResponses: HasManySetAssociationsMixin<Response, any>;
    addResponse: HasManyAddAssociationMixin<Response, any>
}
export type INodeCreation = Optional<INode, 'id' | 'setParents' | 'addParent' | 'setChildren' | 'addChild' | 'setModel' | 'setResponses' | 'addResponse'>;

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