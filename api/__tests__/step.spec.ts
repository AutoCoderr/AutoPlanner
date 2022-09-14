import User from "../models/User";
import request from "supertest";
import app from "../app";
import sequelize from "../sequelize";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Response from "../models/Response";
import Todo from "../models/Todo";
import expectElem from "../libs/tests/expectElem";
import Step from "../models/Step";
import createFirstStepOnTodo from "../libs/createFirstStepOnTodo";
import compileDataValues from "../libs/compileDatavalues";
import subStepRoute from "../routes/subStepRoute";

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testStep",
        email: "testStep@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testStep2",
        email: "testStep2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testStep",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})

describe("Tests progress steps in todo", () => {
    let t;

    let todo: Todo;

    let otherNonPublishedModel: TodoModel;
    let otherNonPublishedFirstnode: Node;
    let otherNonPublishedResponse: Response;
    let otherNonPublishedResponseAction: Node;

    let otherPublishedModel: TodoModel;
    let otherPublishedFirstnode: Node;
    let otherPublishedResponse: Response;
    let otherPublishedResponseAction: Node;

    let model: TodoModel;
    let firstnode: Node;

    let firstnodeResponse1: Response;
    let action: Node;
    let subAction: Node;


    let firstnodeResponse2: Response;
    let question: Node;
    let questionResponseAction: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });


        otherNonPublishedModel = await TodoModel.create({
            name: "other non published model",
            user_id: user2.id
        });
        otherNonPublishedFirstnode = await Node.create({
            text: "other non published node",
            type: "action",
            model_id: otherNonPublishedModel.id
        });
        otherNonPublishedModel.firstnode_id = otherNonPublishedFirstnode.id;
        await otherNonPublishedModel.save();
        otherNonPublishedResponseAction = await Node.create({
            text: "other non published response action",
            type: "action",
            model_id: otherNonPublishedModel.id
        });
        await otherNonPublishedFirstnode.addChild(otherNonPublishedResponseAction);
        otherNonPublishedResponse = await Response.create({
            text: "other non published response",
            question_id: otherNonPublishedFirstnode.id,
            action_id: otherNonPublishedResponseAction.id
        })


        otherPublishedModel = await TodoModel.create({
            name: "other published model",
            user_id: user2.id,
            published: true
        });
        otherPublishedFirstnode = await Node.create({
            text: "other published node",
            type: "question",
            model_id: otherPublishedModel.id
        });
        otherPublishedModel.firstnode_id = otherPublishedFirstnode.id;
        await otherPublishedModel.save();
        otherPublishedResponseAction = await Node.create({
            text: "other published response action",
            type: "action",
            model_id: otherPublishedModel.id
        });
        await otherPublishedFirstnode.addChild(otherPublishedResponseAction);
        otherPublishedResponse = await Response.create({
            text: "other published response",
            question_id: otherPublishedFirstnode.id,
            action_id: otherPublishedResponseAction.id
        })

    })

    afterAll(() => t.rollback())

    test("Create todo on other non published user model", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "toto",
                model_id: otherNonPublishedModel.id
            })
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        "violations": [
                            {
                                "propertyPath": "model_id",
                                "message": "Vous n'avez pas accès à ce modèle"
                            }
                        ]
                    }
                })
            )
    })

    test("Create todo on other published user model", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "toto",
                model_id: otherPublishedModel.id
            })
            .then(async res => {
                todo = await expectElem({
                    res,
                    code: 201,
                    model: Todo,
                    toCheck: (jsonRes) => ({
                        id: expect.any(Number),
                        name: "toto",
                        description: null,
                        percent: 0,
                        priority: 1,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        user_id: user.id,
                        model_id: otherPublishedModel.id,
                        parent_id: null
                    })
                })

                return todo.destroy();
            })
    })

    test("Create todo on own model", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "toto",
                model_id: model.id
            })
            .then(async res => {
                todo = await expectElem({
                    res,
                    code: 201,
                    model: Todo,
                    toCheck: (jsonRes) => ({
                        id: expect.any(Number),
                        name: "toto",
                        description: null,
                        percent: 0,
                        priority: 1,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        user_id: user.id,
                        model_id: model.id,
                        parent_id: null
                    })
                })

                const step = await Step.findOne({
                    where: {
                        todo_id: todo.id
                    }
                });
                expect(step).toBe(null)
            })
    })

    test("recreate first step on todo without firstnode on model", () => {
        return request(app)
            .post("/todos/" + todo.id + "/first_step")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409)
            })
    })

    test("Add first node, and recreate first step on todo", async () => {
        firstnode = await Node.create({
            text: "firstnode",
            type: "question",
            model_id: model.id
        })

        model.firstnode_id = firstnode.id;
        await model.save();

        return request(app)
            .post("/todos/" + todo.id + "/first_step")
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                await expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent: 0,
                        percentSynchronized: false,
                        nb: 1,
                        node_id: firstnode.id,
                        todo_id: todo.id,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })

                return todo.destroy();
            })
    })

    test("Recreate todo", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "toto",
                model_id: model.id
            })
            .then(async res => {
                todo = await expectElem({
                    res,
                    code: 201,
                    model: Todo,
                    toCheck: (jsonRes) => ({
                        id: expect.any(Number),
                        name: "toto",
                        description: null,
                        percent: 0,
                        priority: 1,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        user_id: user.id,
                        model_id: model.id,
                        parent_id: null
                    })
                })

                const step = await Step.findOne({
                    where: {
                        todo_id: todo.id,
                        node_id: firstnode.id
                    }
                });
                expect(step).not.toBe(null)
            })
    })

    test("Create step as response of other non published user node", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: otherNonPublishedFirstnode.id
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
                                "propertyPath": "parent_node",
                                "message": "Vous n'avez pas accès au noeud spécifié"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response other published user node", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: otherPublishedFirstnode.id
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
                                "propertyPath": "parent_node",
                                "message": "Vous n'avez pas accès au noeud spécifié"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response of firstnode which has nothing children", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id
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
                                "propertyPath": "parent_node",
                                "message": "Pour passez à l'étape suivante, vous devez soit avoir une question avec au moins une réponse, soit une action avec seulement un enfant"
                            }
                        ]
                    }
                })
            ).then(async () => {
                // Create children and responses, except relation between firstnode and action

                action = await Node.create({
                    text: "action",
                    type: "action",
                    model_id: model.id
                })
                question = await Node.create({
                    text: "question",
                    type: "question",
                    model_id: model.id
                })
                questionResponseAction = await Node.create({
                    text: "question response action",
                    type: "action",
                    model_id: model.id
                })
                await question.addChild(questionResponseAction);

                await firstnode.addChild(question)

                firstnodeResponse1 = await Response.create({
                    text: "first node response 1",
                    question_id: firstnode.id,
                    action_id: action.id
                })

                firstnodeResponse2 = await Response.create({
                    text: "first node response 2",
                    question_id: firstnode.id,
                    action_id: question.id
                })
            })
    })

    test("Create step as response on node which is not accessible at the time on the todo", async () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: question.id
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
                                "propertyPath": "parent_node",
                                "message": "Vous n'avez pour le moment pas accès à cette étape de la todo"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response of firstnode, without specifying a response object", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id
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
                                "propertyPath": "response",
                                "message": "Champs 'response' non spécifié"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response, with response object of other non published firstnode", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id,
                response: otherNonPublishedResponse.id
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
                                "propertyPath": "response",
                                "message": "Vous ne pouvez pas répondre avec cette réponse"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response, with response object of other published firstnode", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id,
                response: otherPublishedResponse.id
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
                                "propertyPath": "response",
                                "message": "Vous ne pouvez pas répondre avec cette réponse"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response of firstnode, with good response object, without relation between firstnode and action", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id,
                response: firstnodeResponse1.id
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
                                "propertyPath": "response",
                                "message": "Vous ne pouvez pas répondre avec cette réponse"
                            }
                        ]
                    }
                })
            )
            .then(() => firstnode.addChild(action))
    })

    test("Create step as response of firstnode, successfuly", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id,
                response: firstnodeResponse1.id
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent: 0,
                        percentSynchronized: false,
                        nb: 1,
                        node_id: action.id,
                        todo_id: todo.id,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })
            )
    })

    test("Create step as response of action, without child on action", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: action.id
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
                                "propertyPath": "parent_node",
                                "message": "Pour passez à l'étape suivante, vous devez soit avoir une question avec au moins une réponse, soit une action avec seulement un enfant"
                            }
                        ]
                    }
                })
            )
            .then(async () => {
                subAction = await Node.create({
                    text: "sub action",
                    type: "action",
                    model_id: model.id
                });
                await action.addChild(subAction);
                await subAction.addChild(firstnode);
            })
    })

    test("Create step as response of action, specifying a response", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: action.id,
                response: firstnodeResponse1.id
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
                                "propertyPath": "response",
                                "message": "Vous ne pouvez pas répondre avec cette réponse"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response of action, successfuly", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: action.id
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent: 0,
                        percentSynchronized: false,
                        nb: 1,
                        node_id: subAction.id,
                        todo_id: todo.id,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })
            )
    })

    test("Create another step as response of action", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: action.id
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
                                "propertyPath": "parent_node",
                                "message": "Vous n'avez pour le moment pas accès à cette étape de la todo"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step as response of subaction, which will create a new step on firstnode", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: subAction.id
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent: 0,
                        percentSynchronized: false,
                        nb: 2,
                        node_id: firstnode.id,
                        todo_id: todo.id,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })
            )
    })
})

describe("Tests create, update, and delete steps", () => {
    let t;

    let model: TodoModel;
    let firstnode: Node;
    let action: Node;
    let subAction: Node;

    let todo: Todo;

    let stepFirstnode: Step;
    let stepAction: Step;
    let stepSubAction: Step;

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
        });
        model.firstnode_id = firstnode.id;
        await model.save();

        action = await Node.create({
            text: "action",
            type: "action",
            model_id: model.id
        })
        await firstnode.addChild(action);

        subAction = await Node.create({
            text: "sub action",
            type: "action",
            model_id: model.id
        });
        await action.addChild(subAction);

        todo = await Todo.create({
            name: "todo",
            user_id: user.id,
            model_id: model.id
        })
        stepFirstnode = await <Promise<Step>>createFirstStepOnTodo(todo);
    });

    afterAll(() => t.rollback());


    test("Create step with bad fields", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                percentSynchronized: 123,
                percent: "coucou",
                deadLine: "abc",
                parent_node: firstnode.id
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
                                "propertyPath": "percentSynchronized",
                                "message": "Vous devez rentrer un booléen"
                            },
                            {
                                "propertyPath": "percent",
                                "message": "Vous devez spécifier un nombre entre 0 et 100"
                            },
                            {
                                "propertyPath": "deadLine",
                                "message": "Vous devez rentrer une date valide"
                            }
                        ]
                    }
                })
            )
    });

    test("Create step with percent mentionned, but percent synchronized", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id,
                deadLine: '2022-12-12',
                percentSynchronized: true,
                percent: 50
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
                                "propertyPath": "percent",
                                "message": "Vous ne pouvez pas définir le pourcentage s'il est déjà synchronisé"
                            }
                        ]
                    }
                })
            )
    })

    test("Create step successfully", () => {
        return request(app)
            .post("/todos/" + todo.id + "/steps")
            .send({
                parent_node: firstnode.id,
                deadLine: '2022-12-12',
                percent: 50
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                stepAction = await expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent: 50,
                        percentSynchronized: false,
                        nb: 1,
                        node_id: action.id,
                        todo_id: todo.id,
                        deadLine: jsonRes ? new Date("2022-12-12").toISOString() : new Date("2022-12-12"),
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })


                // Set percentSynchronized for futur update tests
                stepAction.percentSynchronized = true;
                return stepAction.save();
            })
    })

    test("Update percent of firstnode step", () => {
        return request(app)
            .patch("/steps/" + stepFirstnode.id)
            .send({
                percent: 50
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    model: Step,
                    toCheck: jsonRes => ({
                        ...compileDataValues(stepFirstnode),
                        percent: 50,
                        createdAt: jsonRes ? stepFirstnode.createdAt.toISOString() : stepFirstnode.createdAt,
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })
            )
    })

    test("Update percent of firstnode step, setting percentSynchronized to true", () => {
        return request(app)
            .patch("/steps/" + stepFirstnode.id)
            .send({
                percentSynchronized: true,
                percent: 50
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
                                "propertyPath": "percent",
                                "message": "Vous ne pouvez pas définir le pourcentage s'il est déjà synchronisé"
                            }
                        ]
                    }
                })
            )
    })

    test("Update percent of action step, keeping percentSynchronized on true", () => {
        return request(app)
            .patch("/steps/" + stepAction.id)
            .send({
                percent: 50
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
                                "propertyPath": "percent",
                                "message": "Vous ne pouvez pas définir le pourcentage s'il est déjà synchronisé"
                            }
                        ]
                    }
                })
            )
    })

    test("Update percent of action step, setting percentSynchronized to true", () => {
        return request(app)
            .patch("/steps/" + stepAction.id)
            .send({
                percentSynchronized: true,
                percent: 50
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
                                "propertyPath": "percent",
                                "message": "Vous ne pouvez pas définir le pourcentage s'il est déjà synchronisé"
                            }
                        ]
                    }
                })
            )
    })

    test("Update percent of action step, setting percentSynchronized to false", () => {
        return request(app)
            .patch("/steps/" + stepAction.id)
            .send({
                percentSynchronized: false,
                percent: 20
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    model: Step,
                    toCheck: jsonRes => ({
                        ...compileDataValues(stepAction),
                        percent: 20,
                        percentSynchronized: false,
                        createdAt: jsonRes ? stepAction.createdAt.toISOString() : stepAction.createdAt,
                        updatedAt: expect.any(jsonRes ? String : Date),
                        deadLine: jsonRes ? stepAction.deadLine.toISOString() : stepAction.deadLine,
                    })
                })
            )
    })



    test("Create sub action step, and delete action step", async () => {
        stepSubAction = await Step.create({
            node_id: subAction.id,
            todo_id: todo.id
        })

        return request(app)
            .delete("/steps/"+stepAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 403,
                    checkBody: false,
                    model: Step,
                    id: stepAction.id,
                    toCheck: expect.any(Object)
                })
            )
    })

    test("Delete sub action step", () => {
        return request(app)
            .delete("/steps/"+stepSubAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    model: Step,
                    id: stepSubAction.id,
                    toCheck: null
                })
            )
    })

    test("Delete action step, successfully", () => {
        return request(app)
            .delete("/steps/"+stepAction.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    model: Step,
                    id: stepAction.id,
                    toCheck: null
                })
            )
    })

    test("Delete firstnode step", () => {
        return request(app)
            .delete("/steps/"+stepFirstnode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 403,
                    checkBody: false,
                    model: Step,
                    id: stepFirstnode.id,
                    toCheck: expect.any(Object)
                })
            )
    })
})