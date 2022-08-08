import {
    BelongsToManyAddAssociationMixin,
    BelongsToManySetAssociationsMixin,
    BelongsToSetAssociationMixin, HasManyAddAssociationMixin, HasManySetAssociationsMixin, Optional
} from "sequelize";
import Node from "../models/Node";
import TodoModel from "../models/TodoModel";
import Response from "../models/Response";
import {ITodoModel} from "./TodoModel";
import {IResponse} from "./Response";

export interface INode {
    id: number;
    text: string;
    type: 'action'|'question';
    model_id: number;

    setParents: BelongsToManySetAssociationsMixin<INode|Node, any>;
    addParent: BelongsToManyAddAssociationMixin<INode|Node, any>;
    setChildren: BelongsToManySetAssociationsMixin<INode|Node, any>;
    addChild: BelongsToManyAddAssociationMixin<INode|Node, any>;
    setModel: BelongsToSetAssociationMixin<ITodoModel|TodoModel, any>;
    setResponses: HasManySetAssociationsMixin<IResponse|Response, any>;
    addResponse: HasManyAddAssociationMixin<IResponse|Response, any>
}
export type INodeCreation = Optional<INode, 'id' | 'setParents' | 'addParent' | 'setChildren' | 'addChild' | 'setModel' | 'setResponses' | 'addResponse'>;

export interface INodeWithParents extends INode {
    parents: INode[]
}
export interface INodeWithChildren extends INode {
    children: INode[]
}
export interface INodeWithModel extends INode {
    model: ITodoModel
}
export interface INodeWithResponses extends INode {
    responses: IResponse[]
}