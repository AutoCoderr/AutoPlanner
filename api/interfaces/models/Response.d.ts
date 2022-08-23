import {BelongsToSetAssociationMixin, InferAttributes, Optional} from "sequelize";
import Node from "../../models/Node";

export interface IResponse {
    id: number;
    text: string;
    question_id: number;
    action_id: number;

    setQuestion: BelongsToSetAssociationMixin<Node, any>;
    setAction: BelongsToSetAssociationMixin<Node, any>;
}
export type IResponseCreation = InferAttributes<Optional<IResponse, 'id' >>;

export interface ResponseWithQuestion extends Response {
    question: Node
}
export interface ResponseWithAction extends Response {
    action: Node
}