import {BelongsToSetAssociationMixin, Optional} from "sequelize";
import Node from "../../models/Node";

export interface IResponse {
    id: number;
    text: string;
    question_id: number;
    action_id: number;

    setQuestion: BelongsToSetAssociationMixin<Node, any>;
    setAction: BelongsToSetAssociationMixin<Node, any>;
}
export type IResponseCreation = Optional<IResponse, 'id' | 'setQuestion' | 'setAction'>;

export interface ResponseWithQuestion extends Response {
    question: Node
}
export interface ResponseWithAction extends Response {
    action: Node
}