import request from "supertest";
import User from "../models/User";
import app from "../app";
import sequelize from "../sequelize";
import TodoModel from "../models/TodoModel";
import IViolation from "../interfaces/form/IViolations";
import Node from "../models/Node";
import Response from "../models/Response";

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testModel",
        email: "testModel@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testModel2",
        email: "testModel2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testModel",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})

describe("Test create models", () => {
    let t;

    let modelWithSameName: TodoModel;
    let modelWithSameNameOtherUser: TodoModel;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        modelWithSameName = await TodoModel.create({
            name: "same name",
            user_id: user.id
        })
        modelWithSameNameOtherUser = await TodoModel.create({
            name: "same name 2",
            user_id: user2.id
        })
    })

    afterAll(() => t.rollback());

    test("Create model without connection", () => {
        return request(app)
            .post("/models")
            .send({
                name: "Test",
                description: "coucou"
            })
            .then(res => {
                expect(res.statusCode).toEqual(401)
            })
    })

    test("Create model with bad fields", () => {
        return request(app)
            .post("/models")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: true,
                description: 1234
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "name",
                            "message": "Le nom doit faire entre 2 et 50 caractères"
                        },
                        {
                            "propertyPath": "description",
                            "message": "La description doit faire entre 2 et 200 caractères"
                        }
                    ]
                })
            })
    })

    test("Create model successfully", () => {
        return request(app)
            .post("/models")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "test",
                description: "coucou",
                published: true
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "test",
                    description: "coucou",
                    published: false,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    firstnode_id: null
                })
            })
    })

    test("Create model with already used name", () => {
        return request(app)
            .post("/models")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: modelWithSameName.name
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "name",
                            "message": "Vous possédez déjà un modèle avec ce nom"
                        }
                    ]
                })
            })
    })

    test("Create model with already used name by another user", () => {
        return request(app)
            .post("/models")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: modelWithSameNameOtherUser.name
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: modelWithSameNameOtherUser.name,
                    description: null,
                    published: false,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    firstnode_id: null
                })
            })
    })
});

describe("Tests update model", () => {
    let t;
    let modelToPut: TodoModel;
    let modelToPatch: TodoModel;

    let firstNode1: Node;
    let firstNode2: Node;

    let model2: TodoModel;

    let modelOtherUserNotPublished: TodoModel;
    let modelOtherUserPublished: TodoModel;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        modelToPut = await TodoModel.create({
            name: "model to put",
            user_id: user.id
        });
        firstNode1 = await Node.create({
            text: "first node",
            type: "action",
            model_id: modelToPut.id
        });
        modelToPut.firstnode_id = firstNode1.id;
        await modelToPut.save();

        model2 = await TodoModel.create({
            name: "model 2",
            published: true,
            user_id: user.id
        });

        modelToPatch = await TodoModel.create({
            name: "model to patch",
            user_id: user.id
        });
        firstNode2 = await Node.create({
            text: "first node 2",
            type: "action",
            model_id: modelToPatch.id
        });
        modelToPatch.firstnode_id = firstNode2.id;
        await modelToPatch.save();

        modelOtherUserNotPublished = await TodoModel.create({
            name: "other not published model",
            user_id: user2.id
        })
        modelOtherUserPublished = await TodoModel.create({
            name: "other published model",
            published: true,
            user_id: user2.id
        })
    });
    afterAll(() => t.rollback());


    test("Put with bad fields", () => {
        return request(app)
            .put("/models/"+modelToPut.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                description: 1234,
                published: "coucou"
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "published",
                            "message": "Vous devez rentrer un booléen"
                        },
                        {
                            "propertyPath": "name",
                            "message": "Champs 'name' non spécifié"
                        },
                        {
                            "propertyPath": "description",
                            "message": "La description doit faire entre 2 et 200 caractères"
                        }
                    ]
                })
            })
    });

    test("Put with name already name used by same user", () => {
        return request(app)
            .put("/models/"+modelToPut.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "model 2",
                published: false
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "name",
                            "message": "Vous possédez déjà un modèle avec ce nom"
                        }
                    ]
                })
            })
    })

    test("Put published true with already used name by other published user model", () => {
        return request(app)
            .put("/models/"+modelToPut.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "other published model",
                description: "coucou",
                published: true
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "name",
                            "message": "Le nom de ce modèle est déjà pris, vous devez le changer"
                        }
                    ]
                })
            })
    })

    test("Put already used name by other published user model keeping published false", () => {
        return request(app)
            .put("/models/"+modelToPut.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "other published model",
                published: false
            })
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.text)).toEqual({
                    id: modelToPut.id,
                    name: "other published model",
                    description: null,
                    published: false,
                    createdAt: modelToPut.createdAt.toISOString(),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    firstnode_id: firstNode1.id
                })
            })
    })

    test("Put other user model", () => {
        return request(app)
            .put("/models/"+modelOtherUserPublished.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "model to put",
                published: true
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Put published true with name used by non published other user model", () => {
        return request(app)
            .put("/models/"+modelToPut.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "other not published model",
                published: true
            })
            .then(async res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: modelToPut.id,
                    name: "other not published model",
                    description: null,
                    published: true,
                    createdAt: modelToPut.createdAt.toISOString(),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    firstnode_id: firstNode1.id
                })

                return TodoModel.update({
                    name: "model to put"
                }, {
                    where: {
                        id: modelToPut.id
                    }
                })
            })
    })

    test("Put on published model", () => {
        return request(app)
            .put("/models/"+modelToPut.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "abcdef",
                description: "coucou",
                published: false
            })
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Patch with bad fields", () => {
        const toPatch: {key: string, value: any, violation: IViolation}[] = [
            {
                key: "name",
                value: 1234,
                violation: {
                    propertyPath: "name", message: "Le nom doit faire entre 2 et 50 caractères"
                }
            },
            {
                key: "name",
                value: "a",
                violation: {
                    propertyPath: "name", message: "Le nom doit faire entre 2 et 50 caractères"
                }
            },
            {
                key: "name",
                value: "model 2",
                violation: {
                    propertyPath: "name", message: "Vous possédez déjà un modèle avec ce nom"
                }
            },
            {
                key: "published",
                value: 12,
                violation: {
                    propertyPath: "published", message: "Vous devez rentrer un booléen"
                }
            },
            {
                key: "description",
                value: true,
                violation: {
                    propertyPath: "description", message: "La description doit faire entre 2 et 200 caractères",
                }
            }
        ]

        return Promise.all(
            toPatch.map(({key,value,violation}) =>
                request(app)
                    .patch("/models/"+modelToPatch.id)
                    .set('Authorization', 'Bearer ' + jwt)
                    .send({
                        [key]: value
                    })
                    .then(res => {
                        expect(res.statusCode).toEqual(422);
                        expect(JSON.parse(res.text)).toEqual({
                            violations: [violation]
                        })
                    })
            )
        )
    })

    test("Patch published true with name already used by other user model", () => {
        return request(app)
            .patch("/models/"+modelToPatch.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "other published model",
                published: true
            })
            .then(res => {
                expect(res.statusCode).toEqual(422)
                expect(JSON.parse(res.text)).toEqual({
                    violations: [
                        {
                            propertyPath: "name",
                            message: "Le nom de ce modèle est déjà pris, vous devez le changer"
                        }
                    ]
                })
            })
    })

    test("Patch with name already used by other user model keeping published false", () => {
        return request(app)
            .patch("/models/"+modelToPatch.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "other published model"
            })
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: modelToPatch.id,
                    name: "other published model",
                    description: modelToPatch.description,
                    published: false,
                    createdAt: modelToPatch.createdAt.toISOString(),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    firstnode_id: firstNode2.id
                })
            })
    })

    test("Patch published true, with name already used by other user model", () => {
        return request(app)
            .patch("/models/"+modelToPatch.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                published: true
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    violations: [
                        {
                            propertyPath: "name",
                            message: "Le nom de ce modèle est déjà pris, vous devez le changer"
                        }
                    ]
                })
            })
    })

    test("Patch published true, with name used by not published other user model", () => {
        return request(app)
            .patch("/models/"+modelToPatch.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "other not published model",
                published: true
            })
            .then(async res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: modelToPatch.id,
                    name: "other not published model",
                    description: modelToPatch.description,
                    published: true,
                    createdAt: modelToPatch.createdAt.toISOString(),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    firstnode_id: firstNode2.id
                })
            })
    })

    test("Patch on published model", () => {
        return request(app)
            .patch("/models/"+modelToPatch.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                published: false
            })
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })
})

function testPublishModel(model: TodoModel, firstnode: null|Node = null, success = false) {
    return request(app)
        .patch("/models/"+model.id)
        .set('Authorization', 'Bearer ' + jwt)
        .send({
            published: true
        })
        .then(res => {
            expect(res.statusCode).toEqual(success ? 200 : 422);
            expect(JSON.parse(res.text)).toEqual((success && firstnode) ? {
                id: model.id,
                name: model.name,
                description: model.description,
                published: true,
                firstnode_id: firstnode.id,
                user_id: user.id,
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            } : {
                "violations": [
                    {
                        "propertyPath": "published",
                        "message": "Vous ne pouvez pas encore publier ce modèle"
                    }
                ]
            });
        })
}

describe("Tests publish model, with invalid and valid tree", () => {
    let t;

    let model: TodoModel;
    let firstnode: Node;
    let action: Node;
    let question: Node;
    let responseAction: Node;
    let responseQuestion: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "Test model",
            user_id: user.id
        });
    });

    afterAll(() => t.rollback());

    test("Publish model without firstnode", () => {
        return testPublishModel(model)
    });

    test("Publish model with only a firstnode", async () => {
        firstnode = await Node.create({
            text: "firstnode",
            type: "action",
            model_id: model.id
        });

        model.firstnode_id = firstnode.id;
        await model.save();

        return testPublishModel(model, firstnode, true)
    })

    test("Publish model with an orphan action", async () => {
        await TodoModel.update({
            published: false
        }, {
            where: {id: model.id}
        })

        action = await Node.create({
            text: "action",
            type: "action",
            model_id: model.id
        });

        return testPublishModel(model);
    })

    test("Publish model with a linked action", async () => {
        await firstnode.addChild(action);

        return testPublishModel(model, firstnode, true);
    })

    test("Publish with two children on an action", async () => {
        await TodoModel.update({
            published: false
        }, {
            where: {id: model.id}
        })
        question = await Node.create({
            text: "question",
            type: "question",
            model_id: model.id
        });

        await firstnode.addChild(question);

        return testPublishModel(model);
    })

    test("Publish with an orphan question", async () => {
        await firstnode.removeChild(question);

        return testPublishModel(model);
    })

    test("Publish with a linked question but with 0 responses", async () => {
        await action.addChild(question);

        return testPublishModel(model);
    })

    test("Publish with a question which has children without associated responses", async () => {
        responseAction = await Node.create({
            text: "response action",
            type: "action",
            model_id: model.id
        })
        responseQuestion = await Node.create({
            text: "response question",
            type: "question",
            model_id: model.id
        })

        await question.addChild(responseAction);
        await question.addChild(responseQuestion);

        return testPublishModel(model);
    })

    test("Publish with a question which has only one child with associated responses", async () => {
        await Response.create({
            text: "A",
            question_id: question.id,
            action_id: responseAction.id
        })

        return testPublishModel(model)
    })

    test("Publish with a question which has all associated responses", async () => {
        await Response.create({
            text: "B",
            question_id: question.id,
            action_id: responseQuestion.id
        });

        const subResponseAction = await Node.create({
            text: "sub response action",
            type: "action",
            model_id: model.id
        })

        await responseQuestion.addChild(subResponseAction);

        await Response.create({
            text: "C",
            question_id: responseQuestion.id,
            action_id: subResponseAction.id
        })

        return testPublishModel(model, firstnode, true);
    })
})

describe("Tests get model", () => {
    let t;

    let model: TodoModel;
    let publishedMode: TodoModel;
    let otherModel: TodoModel;
    let otherPublishedModel: TodoModel;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });
        publishedMode = await TodoModel.create({
            name: "published model",
            published: true,
            user_id: user.id
        })

        otherModel = await TodoModel.create({
            name: "other model",
            user_id: user2.id
        })
        otherPublishedModel = await TodoModel.create({
            name: "other published model",
            published: true,
            user_id: user2.id
        })
    })
    afterAll(() => t.rollback())

    test("Get not published model", () => {
        return request(app)
            .get("/models/"+model.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: model.id,
                    name: model.name,
                    description: null,
                    published: false,
                    createdAt: model.createdAt.toISOString(),
                    updatedAt: model.updatedAt.toISOString(),
                    user_id: user.id,
                    firstnode_id: null
                })
            })
    })

    test("Get published model", () => {
        return request(app)
            .get("/models/"+publishedMode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: publishedMode.id,
                    name: publishedMode.name,
                    description: null,
                    published: true,
                    createdAt: publishedMode.createdAt.toISOString(),
                    updatedAt: publishedMode.updatedAt.toISOString(),
                    user_id: user.id,
                    firstnode_id: null
                })
            })
    })

    test("Get other published model", () => {
        return request(app)
            .get("/models/"+otherPublishedModel.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: otherPublishedModel.id,
                    name: otherPublishedModel.name,
                    description: null,
                    published: true,
                    createdAt: otherPublishedModel.createdAt.toISOString(),
                    updatedAt: otherPublishedModel.updatedAt.toISOString(),
                    user_id: user2.id,
                    firstnode_id: null
                })
            })
    })

    test("Get other not published model", () => {
        return request(app)
            .get("/models/"+otherModel.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })
})

function getModelsListJson(...models: TodoModel[]) {
    return models.map(({id,name, description,published, user_id, createdAt, updatedAt}) => ({
        id,
        name,
        description,
        published,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        user_id,
        firstnode_id: null
    }))
}

describe("Tests get all models", () => {
    let t;

    let ownModel1: TodoModel;
    let ownModel2: TodoModel;
    let ownModel3: TodoModel;

    let otherModel1: TodoModel;
    let otherModel2: TodoModel;
    let otherModel3: TodoModel;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        ownModel1 = await TodoModel.create({
            name: "b test ananas",
            user_id: user.id,
            updatedAt: new Date("2023/08/11")
        });
        ownModel2 = await TodoModel.create({
            name: "c test",
            user_id: user.id,
            description: "ananas",
            published: true,
            updatedAt: new Date("2023/08/10")
        })
        ownModel3 = await TodoModel.create({
            name: "a test",
            user_id: user.id,
            updatedAt: new Date("2023/08/12")
        })

        otherModel1 = await TodoModel.create({
            name: "c other test",
            description: "banana",
            user_id: user2.id,
            updatedAt: new Date("2023/08/11")
        });
        otherModel2 = await TodoModel.create({
            name: "b other test banana",
            user_id: user2.id,
            published: true,
            updatedAt: new Date("2023/08/10")
        })
        otherModel3 = await TodoModel.create({
            name: "a other test",
            user_id: user2.id,
            published: true,
            updatedAt: new Date("2023/08/12")
        })

    })
    afterAll(() => t.rollback())

    test("Get all own models", () => {
        return request(app)
            .get("/models/")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel1,ownModel2,ownModel3)
                )
            })
    })

    test("Get all own models, trying filter and sort with not exists fields", () => {
        return request(app)
            .get("/models?asc=artichaud,ananas&wesh=12")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel1,ownModel2,ownModel3)
                )
            })
    })

    test("Get own models order by updatedAt desc with published false", () => {
        return request(app)
            .get("/models?desc=updatedAt&published=false")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel3,ownModel1)
                )
            })
    })

    test("Get own models order by name asc with published false", () => {
        return request(app)
            .get("/models?asc=name&published=false")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel3,ownModel1)
                )
            })
    })

    test("Get own models published true", () => {
        return request(app)
            .get("/models?published=true")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel2)
                )
            })
    })

    test("Get own models searching 'ananas'", () => {
        return request(app)
            .get("/models?search=ananas")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel1,ownModel2)
                )
            })
    })

    test("Get own models order by updatedAt desc/asc and name desc", () => {
        return request(app)
            .get("/models?desc=updatedAt,name&asc=updatedAt")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel2,ownModel1,ownModel3)
                )
            })
    })

    test("Get own models by specified user, order by name desc with 'ananas' search", () => {
        return request(app)
            .get("/users/"+user.id+"/models?desc=name&search=ananas")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel2,ownModel1)
                )
            })
    })

    test("Get other user models", () => {
        return request(app)
            .get("/users/"+user2.id+"/models")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(otherModel2,otherModel3)
                )
            })
    })

    test("Get other user models, order by name asc, trying getting published false", () => {
        return request(app)
            .get("/users/"+user2.id+"/models?asc=name&published=false")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(otherModel3,otherModel2)
                )
            })
    })

    test("Get all published models", () => {
        return request(app)
            .get("/all/models")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(ownModel2,otherModel2,otherModel3)
                )
            })
    })

    test("Get all published models order by updatedAt desc, trying published false", () => {
        return request(app)
            .get("/all/models?desc=updatedAt&published=false")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual(
                    getModelsListJson(otherModel3,otherModel2,ownModel2)
                )
            })
    })
})

describe("Tests delete model", () => {
    let t;

    let model: TodoModel;
    let publishedModel: TodoModel;

    let otherModel: TodoModel;
    let otherPublishedModel: TodoModel;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });
        publishedModel = await TodoModel.create({
            name: "published model",
            user_id: user.id,
            published: true
        });
        otherModel = await TodoModel.create({
            name: "other model",
            user_id: user2.id
        });
        otherPublishedModel = await TodoModel.create({
            name: "other published model",
            user_id: user2.id,
            published: true
        })
    });
    afterAll(() => t.rollback());

    test("Delete own not published model", () => {
        return request(app)
            .delete("/models/"+model.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(204);
            })
    })

    test("Delete own published model", () => {
        return request(app)
            .delete("/models/"+publishedModel.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Delete other not published model", () => {
        return request(app)
            .delete("/models/"+otherModel.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Delete other published model", () => {
        return request(app)
            .delete("/models/"+otherPublishedModel.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })
})