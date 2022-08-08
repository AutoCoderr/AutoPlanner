import {BelongsToSetAssociationMixin, Optional} from "sequelize";
import Node from "../models/Node";
import {INode} from "./Node";

export interface IResponse {
    id: number;
    text: string;
    question_id: number;
    action_id: number;

    setQuestion: BelongsToSetAssociationMixin<INode|Node, any>;
    setAction: BelongsToSetAssociationMixin<INode|Node, any>;
}
export type IResponseCreation = Optional<IResponse, 'id' | 'setQuestion' | 'setAction'>;

export interface IResponseWithQuestion extends IResponse {
    question: INode
}
export interface IResponseWithAction extends IResponse {
    action: INode
}