import request from "supertest";
import User from "../models/User";
import app from "../app";
import sequelize from "../sequelize";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import expectElem from "../libs/expectElem";
import compileDataValues from "../libs/compileDatavalues";
import Response from "../models/Response";
import {nodeIncludeResponses} from "../includeConfigs/node";

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

    let model: TodoModel;
    let publishedModel: TodoModel;
    let otherModel: TodoModel;
    let otherNode: Node;
    let firstnode: Node;

    let childAction: Node;
    let subChildAction: Node;

    let thirdChildNode: Node;

    let thirdParent: Node;

    let childQuestion: Node;
    let response1: Response;
    let questionResponseAction: Node;
    let response2: Response;
    let questionResponseQuestion: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model test",
            user_id: user.id
        });
        thirdChildNode = await Node.create({
            text: "third child node",
            type: "action",
            model_id: model.id
        });
        publishedModel = await TodoModel.create({
            name: "published model test",
            user_id: user.id,
            published: true
        });
        otherModel = await TodoModel.create({
            name: "other model test",
            user_id: user2.id
        });
        otherNode = await Node.create({
            text: "other node test",
            type: "question",
            model_id: otherModel.id
        })
    });

    afterAll(() => t.rollback());

    test("Create node with bad fields", () => {
        return request(app)
            .post("/models/"+model.id+"/nodes")
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

    test("Create node on another user model", () => {
        return request(app)
            .post("/models/"+otherModel.id+"/nodes")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                type: "action"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Create node on published model", () => {
        return request(app)
            .post("/models/"+publishedModel.id+"/nodes")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: "coucou",
                type: "action"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Create node successfully", () => {
        const toCreate = {
            text: "coucou",
            type: "action"
        }
        return request(app)
            .post("/models/"+model.id+"/nodes")
            .set('Authorization', 'Bearer ' + jwt)
            .send(toCreate)
            .then(async res => {
                    firstnode = await expectElem({
                        res,
                        toCheck: {
                            ...toCreate,
                            id: expect.any(Number),
                            model_id: model.id
                        },
                        code: 201,
                        model: Node
                    })
                }
            )
    })

    test("Set node as firstnode", () => {
        return request(app)
            .patch("/nodes/"+firstnode.id+"/set_as_firstnode")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    toCheck: {
                        ...compileDataValues(model),
                        firstnode_id: firstnode.id,
                        updatedAt: expect.any(Date)
                    },
                    code: 200,
                    checkBody: false,
                    id: model.id,
                    model: TodoModel
                })
            )
    })

    test("Add child to node of another model", () => {
        return request(app)
            .post("/nodes/"+otherNode.id+"/children")
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
            .post("/nodes/"+firstnode.id+"/children")
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
            .post("/nodes/"+firstnode.id+"/children")
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
            .post("/nodes/"+thirdChildNode.id+"/parents/"+firstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201)
            })
    })

    test("List firstnode children", () => {
        return request(app)
            .get("/nodes/"+firstnode.id+"/children")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => expectElem({
                res,
                code: 200,
                checkDbElem: false,
                toCheck: [thirdChildNode,childAction,childQuestion].map(child => compileDataValues(child))
            }))
    })

    test("Add child to action", () => {
        return request(app)
            .post("/nodes/"+childAction.id+"/children")
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

    test("Add two children to question", () => {
        return Promise.all([
            {
                text: "question action response",
                type: "action"
            },
            {
                text: "question question response",
                type: "question"
            }
        ].map(data =>
            request(app)
                .post("/nodes/"+childQuestion.id+"/children")
                .set('Authorization', 'Bearer ' + jwt)
                .send(data)
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
        )).then(async ([_questionResponseAction,_questionResponseQuestion]) => {
            questionResponseAction = _questionResponseAction;
            questionResponseQuestion = _questionResponseQuestion;
        })
    })

    test("Add response to question, on bad related action in same model", async () => {
        const badAction = await Node.create({
            text: "bad action",
            type: "action",
            model_id: model.id
        });

        return request(app)
            .post("/nodes/"+childQuestion.id+"/responses")
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
                    toCheck:{
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
            .post("/nodes/"+childQuestion.id+"/responses")
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
                    toCheck:{
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
            .post("/nodes/"+childAction.id+"/responses")
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
            .post("/nodes/"+otherNode.id+"/responses")
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
                    .post("/nodes/"+childQuestion.id+"/responses")
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
        ).then(([_response1,_response2]) => {
            response1 = _response1;
            response2 = _response2;
        })
    })

    test("Get responses of an action", () => {
        return request(app)
            .get("/nodes/"+childAction.id+"/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(404);
            })
    })

    test("Get responses on question", () => {
        return request(app)
            .get("/nodes/"+childQuestion.id+"/responses")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [
                        [response1,questionResponseAction],
                        [response2,questionResponseQuestion]
                    ].map(([response,questionAction]) => ({
                        ...compileDataValues(response),
                        action: compileDataValues(questionAction)
                    }))
                })
            )
    })

    test("Add sub child action as child to question response question", () => {
        return request(app)
            .post("/nodes/"+questionResponseQuestion.id+"/children/"+subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Add response between question response question and sub child action",() => {
        return request(app)
            .post("/nodes/"+questionResponseQuestion.id+"/responses")
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

    test("Create a third parent on sub child action", () => {
        const toCreate = {
            text: "third parent",
            type: "action"
        }
        return request(app)
            .post("/nodes/"+subChildAction.id+"/parents")
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

    test("Link third parent to first node", () => {
        return request(app)
            .post("/nodes/"+firstnode.id+"/children/"+thirdChildNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Get sub child action parents", () => {
        return request(app)
            .get("/nodes/"+subChildAction.id+"/parents")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [childAction,questionResponseQuestion,thirdParent].map(parent => compileDataValues(parent))
                })
            )
    })

    test("Remove third parent from sub child action parents", () => {
        return request(app)
            .delete("/nodes/"+subChildAction.id+"/parents/"+questionResponseQuestion.id)
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
            .delete("/nodes/"+thirdParent.id+"/children/"+subChildAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(204)
            })
    })


    test("Re get sub child action parents", () => {
        return request(app)
            .get("/nodes/"+subChildAction.id+"/parents")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [childAction].map(parent => compileDataValues(parent))
                })
            )
    })
})


