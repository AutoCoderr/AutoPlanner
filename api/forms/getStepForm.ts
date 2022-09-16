import IFormGetter from "../interfaces/form/IFormGetter";
import Step from "../models/Step";
import percent from "../asserts/percent";
import formatNumber from "../asserts/format/formatNumber";
import boolean from "../asserts/boolean";
import datetime from "../asserts/datetime";
import formatDatetime from "../asserts/format/formatDatetime";
import Response from "../models/Response";
import responseAccessCheck from "../security/accessChecks/responseAccessCheck";
import Node from "../models/Node";
import nodeAccessCheck from "../security/accessChecks/nodeAccessCheck";
import {NodeWithChildren, NodeWithModel} from "../interfaces/models/Node";
import {nodeIncludeModelAndChildren} from "../includeConfigs/node";
import {responseIncludeQuestionAndAction} from "../includeConfigs/response";
import {ResponseWithAction, ResponseWithQuestion} from "../interfaces/models/Response";
import { IStepCreation} from "../interfaces/models/Step";
import todoStepIsTheLastStep from "../libs/todoStepIsTheLastStep";

type IData = IStepCreation&{parent_node: NodeWithChildren, response: ResponseWithAction&ResponseWithQuestion}

const getStepForm: IFormGetter<Step,IData> = (reqData, method, elem) => ({
    model: Step,
    fields: {
        percentSynchronized: {
            msg: "Vous devez rentrer un booléen",
            valid: boolean,
            required: false
        },
        percent: {
            msg: "Vous devez spécifier un nombre entre 0 et 100",
            valid: percent,
            format: formatNumber,
            otherValidates: [
                {
                    msg: "Vous ne pouvez pas définir le pourcentage s'il est déjà synchronisé",
                    valid: (_, data) => (
                        (elem === null && !data.percentSynchronized) ||
                        (
                            elem !== null &&
                            (
                                data.percentSynchronized === false ||
                                (data.percentSynchronized === undefined && !elem.percentSynchronized)
                            )
                        )
                    )
                }
            ],
            required: false
        },
        deadLine: {
            msg: "Vous devez rentrer une date valide",
            valid: datetime,
            format: formatDatetime,
            required: false
        },
        ...(
            method === "post" ? {
                parent_node: {
                    model: Node,
                    include: nodeIncludeModelAndChildren,
                    msg: "Vous n'avez pas accès au noeud spécifié",
                    valid: (node: NodeWithChildren&NodeWithModel) => reqData.todo !== undefined &&
                        nodeAccessCheck(node, "get", reqData.user) &&
                        node.model_id === reqData.todo.model_id,
                    otherValidates: [
                        {
                            msg: "Pour passez à l'étape suivante, vous devez soit avoir une question avec au moins une réponse, " +
                                "soit une action avec seulement un enfant",
                            valid: (node: NodeWithChildren) => node.children.length > 0 &&
                                (node.type === "question" || node.children.length === 1)
                        },
                        {
                            msg: "Vous n'avez pour le moment pas accès à cette étape de la todo",
                            valid: async (node: NodeWithChildren) => {
                                if (reqData.todo === undefined)
                                    return false;

                                const step = await Step.findOne({
                                    where: {
                                        todo_id: reqData.todo.id,
                                        node_id: node.id
                                    }
                                })
                                if (step === null)
                                    return false;

                                return todoStepIsTheLastStep(step, reqData.todo, node.children);
                            }
                        }
                    ],
                    required: true,
                    inDB: false
                },
                response: {
                    model: Response,
                    include: responseIncludeQuestionAndAction,
                    msg: "Vous ne pouvez pas répondre avec cette réponse",
                    valid: (response: ResponseWithAction&ResponseWithQuestion, {parent_node}) =>
                        parent_node !== undefined &&
                        reqData.todo !== undefined &&
                        parent_node.type === "question" &&
                        responseAccessCheck(response, "get", reqData.user) &&
                        response.question.id === parent_node.id &&
                        response.question.model_id === reqData.todo.model_id &&
                        response.action.model_id === reqData.todo.model_id &&

                        parent_node.children.some(child => child.id === response.action.id)
                    ,
                    inDB: false,
                    required: ({parent_node}) => parent_node !== undefined && parent_node.type === "question"
                }
            } : {}
        )
    },
    additionalFields: method === "post" ? {
        todo_id: () => reqData.todo?.id,
        node_id: ({response, parent_node}) =>
            parent_node.type === "action" ? parent_node.children[0].id : response.action.id,
        nb: async ({parent_node, response}) => {
            if (reqData.todo === undefined)
                return 1;
            const step = await Step.findOne({
                where: {
                    node_id: parent_node.id,
                    todo_id: reqData.todo.id
                }
            })

            const nodeId = parent_node.type === "action" ? parent_node.children[0].id : response.action.id;
            const childStep = await Step.findOne({
                where: {
                    node_id: nodeId,
                    todo_id: reqData.todo.id
                }
            })

            return Math.max(step ? step.nb : 1, childStep ? childStep.nb+1 : 1)
        }
    } : undefined
})

export default getStepForm;