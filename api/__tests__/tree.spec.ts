import request from "supertest";
import User from "../models/User";
import app from "../app";
import sequelize from "../sequelize";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import expectElem from "../libs/tests/expectElem";
import compileDataValues from "../libs/compileDatavalues";
import Response from "../models/Response";
import {nodeIncludeResponses} from "../includeConfigs/node";
import {findNodeChildren} from "../repositories/NodeRepository";
import testTree from "../libs/tests/testTree";

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testTree",
        email: "testTree@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testTree2",
        email: "testTree2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testTree",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})

describe("Tests generate tree", () => {
    let t;

    let ownPublishedModel: TodoModel;
    let ownPublishedNode: Node;

    let ownNonPublishedModel: TodoModel;
    let ownNonPublishedNode: Node;

    let otherModel: TodoModel;
    let otherNode: Node;

    let model: TodoModel;
    let firstnode: Node;

    let betweenChildAction: Node;

    let childAction: Node;
    let subChildAction: Node;

    let thirdChildNode: Node;

    let thirdParent: Node;

    let childQuestion: Node;
    let betweenChildQuestion: Node;

    let response1: Response;
    let questionResponseAction: Node;
    let response2: Response;
    let questionResponseQuestion: Node;

    let subChildQuestion: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model test",
            user_id: user.id
        });
        firstnode = await Node.create({
            text: "first node",
            type: "question",
            model_id: model.id
        });
        model.firstnode_id = firstnode.id;
        await model.save();

        thirdChildNode = await Node.create({
            text: "third child node",
            type: "action",
            model_id: model.id
        });

        ownPublishedModel = await TodoModel.create({
            name: "published model test",
            user_id: user.id,
            published: true
        });
        ownPublishedNode = await Node.create({
            text: "published node",
            type: "action",
            model_id: ownPublishedModel.id
        });
        ownPublishedModel.firstnode_id = ownPublishedNode.id;
        await ownPublishedModel.save();


        ownNonPublishedModel = await TodoModel.create({
            name: "non published model test",
            user_id: user.id,
        });
        ownNonPublishedNode = await Node.create({
            text: "non published node",
            type: "action",
            model_id: ownNonPublishedModel.id
        });
        ownNonPublishedModel.firstnode_id = ownNonPublishedNode.id;
        await ownNonPublishedModel.save();



        otherModel = await TodoModel.create({
            name: "other model test",
            user_id: user2.id
        });
        otherNode = await Node.create({
            text: "other node test",
            type: "question",
            model_id: otherModel.id
        })
        otherModel.firstnode_id = otherNode.id;
        await otherModel.save();
    });

    afterAll(() => t.rollback());

    test("Set firstnode as child of himself", () => {
        return request(app)
            .post("/nodes/"+firstnode.id+"/children/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Create node with bad fields", () => {
        return request(app)
            .post("/nodes/" + firstnode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                type: "ananas"
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "text",
                            "message": "Champs 'text' non spécifié"
                        },
                        {
                            "propertyPath": "type",
                            "message": "Le type ne peut être que 'question' ou 'action'"
                        }
                    ]
                })
            })
    })

    test("Add child to node of published model", () => {
        return request(app)
            .post("/nodes/" + ownPublishedNode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                type: "action"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add child to node of another model", () => {
        return request(app)
            .post("/nodes/" + otherNode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "child",
                type: "action"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add action child to node", () => {
        return request(app)
            .post("/nodes/" + firstnode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "child 1",
                type: "action"
            })
            .then(async res => {
                childAction = await expectElem({
                    res,
                    code: 201,
                    toCheck: {
                        id: expect.any(Number),
                        text: "child 1",
                        type: "action",
                        model_id: model.id
                    },
                    model: Node
                })
            })
    })

    test("Add question child to node", () => {
        return request(app)
            .post("/nodes/" + firstnode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "child 2",
                type: "question"
            })
            .then(async res => {
                childQuestion = await expectElem({
                    res,
                    code: 201,
                    toCheck: {
                        id: expect.any(Number),
                        text: "child 2",
                        type: "question",
                        model_id: model.id
                    },
                    model: Node
                })
            })
    })

    test("Add firstnode to a third child as parent", () => {
        return request(app)
            .post("/nodes/" + thirdChildNode.id + "/parents/" + firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201)
            })
    })

    test("List firstnode children", () => {
        return request(app)
            .get("/nodes/" + firstnode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => expectElem({
                res,
                code: 200,
                checkDbElem: false,
                toCheck: [thirdChildNode, childAction, childQuestion].map(child => compileDataValues(child))
            }))
    })

    test("Add child to action", () => {
        return request(app)
            .post("/nodes/" + childAction.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "sub child action",
                type: "action"
            })
            .then(async res => {
                subChildAction = await expectElem({
                    res,
                    code: 201,
                    model: Node,
                    toCheck: {
                        id: expect.any(Number),
                        text: "sub child action",
                        type: "action",
                        model_id: model.id
                    }
                })
            })
    })

    test("Add second child to action, need to be forbidden because of parent action has already a child", () => {
        return request(app)
            .post("/nodes/"+childAction.id+"/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "Coucou",
                type: "action"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add two children to question", () => {
        return Promise.all([
            {
                text: "question action response",
                type: "action"
            },
            {
                text: "question question response",
                type: "question"
            },
            {
                text: "sub child question",
                type: "action"
            }
        ].map(data =>
            request(app)
                .post("/nodes/" + childQuestion.id + "/children")
                .send(data)
                .set('Authorization', 'Bearer ' + jwt)
                .then(res =>
                    expectElem({
                        res,
                        code: 201,
                        model: Node,
                        toCheck: {
                            ...data,
                            id: expect.any(Number),
                            model_id: model.id
                        }
                    })
                )
        )).then(([_questionResponseAction, _questionResponseQuestion, _subChildQuestion]) => {
            questionResponseAction = _questionResponseAction;
            questionResponseQuestion = _questionResponseQuestion;
            subChildQuestion = _subChildQuestion;
        })
    })

    test("Try to change child question type to 'action'", () => {
        return request(app)
            .patch("/nodes/"+childQuestion.id)
            .send({
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        "violations": [
                            {
                                "propertyPath": "type",
                                "message": "Vous ne pouvez pas transformer cette question en action si elle contient plusieurs enfants"
                            }
                        ]
                    }
                })
            )
    })

    test("Try to change sub child question type to 'action'", () => {
        return request(app)
            .patch("/nodes/"+subChildQuestion.id)
            .send({
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    model: Node,
                    toCheck: jsonRes => ({
                        ...compileDataValues(subChildQuestion),
                        type: "action",
                        ...(
                            jsonRes ? {
                                model: {
                                    ...compileDataValues(model),
                                    createdAt: model.createdAt.toISOString(),
                                    updatedAt: model.updatedAt.toISOString()
                                }
                            } : {}
                        )
                    })
                })
            )
    })

    test("Add response to question, on bad related action in same model", async () => {
        const badAction = await Node.create({
            text: "bad action",
            type: "action",
            model_id: model.id
        });

        return request(app)
            .post("/nodes/" + childQuestion.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                action_id: badAction.id
            })
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        "violations": [
                            {
                                "propertyPath": "action_id",
                                "message": "Vous ne pouvez pas ajouter cette réponse à ce noeud"
                            }
                        ]
                    }
                })
            )
            .then(() => badAction.destroy())
    })

    test("Add response to question, on action of another user model", () => {
        return request(app)
            .post("/nodes/" + childQuestion.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                action_id: otherNode.id
            })
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        "violations": [
                            {
                                "propertyPath": "action_id",
                                "message": "Vous ne pouvez pas ajouter cette réponse à ce noeud"
                            }
                        ]
                    }
                })
            )
    })

    test("Add response to an action", () => {
        return request(app)
            .post("/nodes/" + childAction.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                action_id: questionResponseAction.id
            })
            .then(res => {
                expect(res.statusCode).toEqual(404)
            })
    })

    test("Add response to another user question node", () => {
        return request(app)
            .post("/nodes/" + otherNode.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                action_id: questionResponseAction.id
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add responses successfully to childQuestion", () => {
        return Promise.all(
            [
                {
                    text: "res A",
                    action_id: questionResponseAction.id
                },
                {
                    text: "res B",
                    action_id: questionResponseQuestion.id
                }
            ].map(data =>
                request(app)
                    .post("/nodes/" + childQuestion.id + "/responses")
                    .set('Authorization', 'Bearer ' + jwt)
                    .send(data)
                    .then(res =>
                        expectElem({
                            res,
                            code: 201,
                            toCheck: {
                                ...data,
                                id: expect.any(Number),
                                question_id: childQuestion.id
                            },
                            model: Response
                        })
                    )
            )
        ).then(([_response1, _response2]) => {
            response1 = _response1;
            response2 = _response2;
        })
    })

    test("Get responses of an action", () => {
        return request(app)
            .get("/nodes/" + childAction.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(404);
            })
    })

    test("Get responses on question", () => {
        return request(app)
            .get("/nodes/" + childQuestion.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [
                        [response1, questionResponseAction],
                        [response2, questionResponseQuestion]
                    ].map(([response, questionAction]) => ({
                        ...compileDataValues(response),
                        action: compileDataValues(questionAction)
                    }))
                })
            )
    })

    test("Add sub child action as child to question response question", () => {
        return request(app)
            .post("/nodes/" + questionResponseQuestion.id + "/children/" + subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Add response between question response question and sub child action", () => {
        return request(app)
            .post("/nodes/" + questionResponseQuestion.id + "/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "truc",
                action_id: subChildAction.id
            })
            .then(res =>
                expectElem({
                    res,
                    code: 201,
                    model: Response,
                    toCheck: {
                        id: expect.any(Number),
                        text: "truc",
                        action_id: subChildAction.id,
                        question_id: questionResponseQuestion.id
                    }
                })
            )
    })

    test("Add sub child action as child to question response action", () => {
        return request(app)
            .post("/nodes/" + questionResponseAction.id + "/children/" + subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Create a third parent as firstnode children", () => {
        const toCreate = {
            text: "third parent",
            type: "action"
        }
        return request(app)
            .post("/nodes/" + firstnode.id + "/children")
            .set('Authorization', 'Bearer ' + jwt)
            .send(toCreate)
            .then(async res => {
                thirdParent = await expectElem({
                    res,
                    code: 201,
                    model: Node,
                    toCheck: {
                        ...toCreate,
                        id: expect.any(Number),
                        model_id: model.id
                    }
                })
            })
    });

    test("set third parent as subchild action parent", () => {
        return request(app)
            .post("/nodes/"+subChildAction.id+"/parents/"+thirdParent.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Add sub third parent as child to question response action, need to be forbidden because of parent action has already a child", () => {
        return request(app)
            .post("/nodes/" + questionResponseAction.id + "/children/" + thirdParent.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Add question responses action as parent to third parent, need to be forbidden because of parent action has already a child", () => {
        return request(app)
            .post("/nodes/" + thirdParent.id + "/parents/" + questionResponseAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Get sub child action parents", () => {
        return request(app)
            .get("/nodes/" + subChildAction.id + "/parents")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [childAction, questionResponseAction, questionResponseQuestion, thirdParent].map(parent => compileDataValues(parent))
                })
            )
    })

    test("Remove question response question from sub child action parents", () => {
        return request(app)
            .delete("/nodes/" + subChildAction.id + "/parents/" + questionResponseQuestion.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    getter: () => Node.findOne({
                        where: {id: questionResponseQuestion.id},
                        include: nodeIncludeResponses
                    }),
                    toCheck: {
                        ...compileDataValues(questionResponseQuestion),
                        responses: []
                    }
                })
            )
    })

    test("Remove sub child action from third parent children", () => {
        return request(app)
            .delete("/nodes/" + thirdParent.id + "/children/" + subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(204)
            })
    })

    test("Re Remove sub child action from third parent children", () => {
        return request(app)
            .delete("/nodes/" + thirdParent.id + "/children/" + subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })


    test("Re get sub child action parents", () => {
        return request(app)
            .get("/nodes/" + subChildAction.id + "/parents")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [childAction,questionResponseAction].map(parent => compileDataValues(parent))
                })
            )
    })

    test("Re add sub child action to third parent children", () => {
        return request(app)
            .post("/nodes/" + thirdParent.id + "/children/" + subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201)
            })
    })

    test("Test add node of another model as child of firstnode", () => {
        return request(app)
            .post("/nodes/"+firstnode.id+"/children/"+otherNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Test add node of another own published model as child of firstnode", () => {
        return request(app)
            .post("/nodes/"+firstnode.id+"/children/"+ownPublishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Test add node of another own non published model as child of firstnode", () => {
        return request(app)
            .post("/nodes/"+firstnode.id+"/children/"+ownNonPublishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Get all other model nodes", () => {
        return request(app)
            .get("/models/" + otherModel.id + "/nodes")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Get all model nodes", () => {
        return request(app)
            .get("/models/" + model.id + "/nodes")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [
                        firstnode,
                        childAction,
                        subChildAction,
                        thirdChildNode,
                        thirdParent,
                        childQuestion,
                        questionResponseAction,
                        questionResponseQuestion,
                        subChildQuestion
                    ]
                        .sort((a, b) => a.id - b.id)
                        .map(node => compileDataValues(node))
                })
            )
    })

    test("Set subaction as firstnode parent", () => {
        return request(app)
            .post("/nodes/"+firstnode.id+"/parents/"+subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Remove subaction from firstnode parents", () => {
        return request(app)
            .delete("/nodes/"+subChildAction.id+"/children/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(204);
            })
    })

    test("Re define subaction as firstnode parent", () => {
        return request(app)
            .post("/nodes/"+subChildAction.id+"/children/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Re re define subaction as firstnode parent", () => {
        return request(app)
            .post("/nodes/"+subChildAction.id+"/children/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Remove link between child action and firstnode from child", () => {
        return request(app)
            .delete("/nodes/"+childAction.id+"/parents/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Remove link between child action and firstnode from parent", () => {
        return request(app)
            .delete("/nodes/"+firstnode.id+"/children/"+childAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })


    test("Add node between firstnode and other node", () => {
        return request(app)
            .post("/nodes/between/"+firstnode.id+"/"+otherNode.id)
            .send({
                text: "between child action",
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add node between firstnode and own node in other model", () => {
        return request(app)
            .post("/nodes/between/"+firstnode.id+"/"+ownNonPublishedNode.id)
            .send({
                text: "between child action",
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add node between firstnode and sub child action", () => {
        return request(app)
            .post("/nodes/between/"+firstnode.id+"/"+subChildAction.id)
            .send({
                text: "between child action",
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Add node between firstnode and child action node", () => {
        return request(app)
            .post("/nodes/between/"+firstnode.id+"/"+childAction.id)
            .send({
                text: "between child action",
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                betweenChildAction = await expectElem({
                    res,
                    code: 201,
                    model: Node,
                    toCheck: {
                        id: expect.any(Number),
                        text: "between child action",
                        type: "action",
                        model_id: model.id
                    }
                });
            })
    })

    test("Add node between child question and questionResponseAction", () => {
        return request(app)
            .post("/nodes/between/"+childQuestion.id+"/"+questionResponseAction.id)
            .send({
                text: "between child question",
                type: "action"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                betweenChildQuestion = await expectElem({
                    res,
                    code: 201,
                    model: Node,
                    toCheck: {
                        id: expect.any(Number),
                        text: "between child question",
                        type: "action",
                        model_id: model.id
                    }
                });

                return Response.findOne({
                    where: {
                        id: response1.id
                    }
                }).then(response =>
                    expect(compileDataValues(response)).toEqual({
                        ...compileDataValues(response1),
                        action_id: betweenChildQuestion.id
                    })
                )
            })
    })

    test("Get model tree", async () => {
        const childrenByParentId = {
            [firstnode.id]: [childQuestion.id, thirdChildNode.id, thirdParent.id,betweenChildAction.id],
            [betweenChildAction.id]: [childAction.id],
            [childAction.id]: [subChildAction.id],
            [childQuestion.id]: [questionResponseQuestion.id, subChildQuestion.id, betweenChildQuestion.id],
            [betweenChildQuestion.id]: [questionResponseAction.id],
            [thirdParent.id]: [subChildAction.id],
            [questionResponseAction.id]: [subChildAction.id],
            [subChildAction.id]: [firstnode.id]
        };
        const parentsByChildId = {
            [firstnode.id]: [subChildAction.id],
            [betweenChildAction.id]: [firstnode.id],
            [childAction.id]: [betweenChildAction.id],
            [childQuestion.id]: [firstnode.id],
            [thirdChildNode.id]: [firstnode.id],
            [thirdParent.id]: [firstnode.id],
            [subChildAction.id]: [childAction.id, questionResponseAction.id,thirdParent.id],
            [betweenChildQuestion.id]: [childQuestion.id],
            [questionResponseAction.id]: [betweenChildQuestion.id],
            [questionResponseQuestion.id]: [childQuestion.id],
            [subChildQuestion.id]: [childQuestion.id]
        }
        const responsesByQuestionAndActionId = {
            [childQuestion.id]: {
                [betweenChildQuestion.id]: {
                    ...compileDataValues(response1),
                    action_id: betweenChildQuestion.id
                },
                [questionResponseQuestion.id]: compileDataValues(response2)
            }
        }
        return request(app)
            .get("/models/" + model.id + "/tree")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                testTree(
                    res,
                    model,
                    [
                        firstnode,
                        betweenChildAction,
                        childAction,
                        subChildAction,
                        thirdChildNode,
                        thirdParent,
                        childQuestion,
                        subChildQuestion,
                        betweenChildQuestion,
                        questionResponseAction,
                        questionResponseQuestion
                    ],
                    childrenByParentId,
                    parentsByChildId,
                    responsesByQuestionAndActionId,
                )
            )
    })
})

describe("Tests delete nodes in tree", () => {
    let t;

    let model: TodoModel;
    let firstnode: Node;


    let subAction: Node;

    let question: Node;
    let response1: Response;

    let subQuestion: Node;
    let response2: Response;

    let subSubQuestion: Node;

    let loopNode: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });
        firstnode = await Node.create({
            text: "firstnode",
            type: "action",
            model_id: model.id
        })
        model.firstnode_id = firstnode.id;
        await model.save();

        await generateTestTree();
    })

    async function generateTestTree() {
        subAction = await Node.create({
            text: "sub action",
            type: "action",
            model_id: model.id
        })
        await firstnode.addChild(subAction);


        question = await Node.create({
            text: "question",
            type: "question",
            model_id: model.id
        })
        await subAction.addChild(question);

        subQuestion = await Node.create({
            text: "sub question",
            type: "question",
            model_id: model.id
        });
        await question.addChild(subQuestion);

        response1 = await Response.create({
            text: "response 1",
            question_id: question.id,
            action_id: subQuestion.id
        })

        subSubQuestion = await Node.create({
            text: "sub sub question",
            type: "question",
            model_id: model.id
        })
        await subQuestion.addChild(subSubQuestion);

        response2 = await Response.create({
            text: "response 2",
            question_id: subQuestion.id,
            action_id: subSubQuestion.id
        })

        await subSubQuestion.addChild(firstnode);

        loopNode = await Node.create({
            text: "loop node",
            type: "action",
            model_id: model.id
        })

        await subSubQuestion.addChild(loopNode);

        await loopNode.addChild(subAction);
    }

    afterAll(() => t.rollback());

    test("Delete own firstnode", () => {
        return request(app)
            .delete("/nodes/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Delete sub action, and check if all the tree branch is deleted", () => {
        return request(app)
            .delete("/nodes/"+subAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    getter: () =>
                        Promise.all([
                            ...[subAction.id, question.id, subQuestion.id,subSubQuestion.id,loopNode.id,firstnode.id].map(id =>
                                Node.findOne({
                                    where: {id}
                                })
                            ),
                            ...[response2.id, response2.id].map(id =>
                                Response.findOne({
                                    where: {id}
                                })
                            )
                        ]).then(elems => compileDataValues(elems)),
                    toCheck: compileDataValues([null, null, null, null, null, firstnode, null,null])
                })
            )
            .then(() => generateTestTree())
    })

    test("Delete sub action with recreate link option", () => {
        return request(app)
            .delete("/nodes/"+subAction.id+"?recreate_link=1")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    getter: () =>
                        Promise.all([
                            ...[subAction.id, question.id, subQuestion.id,subSubQuestion.id,loopNode.id,firstnode.id].map(id =>
                                Node.findOne({
                                    where: {id}
                                })
                            ),
                            ...[response1.id,response2.id].map(id =>
                                Response.findOne({
                                    where: {id}
                                })
                            )
                        ]).then(elems => compileDataValues(elems)),
                    toCheck: compileDataValues([null, question, subQuestion, subSubQuestion, loopNode, firstnode,response1,response2])
                })
            )
            .then(async () => {
                const [firstnodeChildren, loopNodeChildren] = await Promise.all([
                    findNodeChildren(firstnode.id),
                    findNodeChildren(loopNode.id)
                ]);

                expect(compileDataValues([firstnodeChildren, loopNodeChildren])).toEqual(compileDataValues([[question],[question]]))
            })
    })
    //need to delete the branch because of recreate doesn't exist for questions
    test("Recreate subAction between after firstnode and loopnode, and delete sub question with recreate link option", async () => {
        subAction = await Node.create({
            text: "sub action",
            type: "action",
            model_id: model.id
        });

        await Promise.all([
            firstnode.removeChild(subQuestion),
            loopNode.removeChild(subQuestion),
            firstnode.addChild(subAction),
            loopNode.addChild(subAction),
            subAction.addChild(subQuestion)
        ])

        return request(app)
            .delete("/nodes/"+subQuestion.id+"?recreate_link=1")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    getter: () =>
                        Promise.all(
                            [
                                ...[subQuestion.id,subSubQuestion.id,loopNode.id,subAction.id,firstnode.id].map(id =>
                                    Node.findOne({
                                        where: {id}
                                    })
                                ),
                                ...[response1.id,response2.id].map(id =>
                                    Response.findOne({
                                        where: {id}
                                    })
                                )
                            ]
                        ).then(elems => compileDataValues(elems)),
                    toCheck: compileDataValues([null, subSubQuestion, loopNode, subAction, firstnode, null, null])
                })
            )
            .then(async () => {
                const subActionChildren = await findNodeChildren(subAction.id);

                expect(compileDataValues(subActionChildren)).toEqual(compileDataValues([subSubQuestion]))
            })
    })

    test("Test delete subsubQuestion which has two children, with recreate link option", () => {
        return request(app)
            .delete("/nodes/"+subSubQuestion.id+"?recreate_link=1")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    getter: () => Promise.all(
                        [subSubQuestion.id, loopNode.id, subAction.id, firstnode.id].map(id =>
                            Node.findOne({
                                where: {id}
                            })
                        )
                    ).then(elems => compileDataValues(elems)),
                    toCheck: compileDataValues([null, null, subAction, firstnode])
                })
            )
    })
})

