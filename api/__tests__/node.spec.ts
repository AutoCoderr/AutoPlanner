import request from "supertest";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import sequelize from "../sequelize";
import app from "../app";
import expectElem from "../libs/tests/expectElem";
import User from "../models/User";
import compileDataValues from "../libs/compileDatavalues";
import {nodeIncludeModel} from "../includeConfigs/node";
import {ITodoModelCreation} from "../interfaces/models/TodoModel";
import {INodeCreation} from "../interfaces/models/Node";

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testNode",
        email: "testNode@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testNode2",
        email: "testNode2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testNode",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})


async function createNodesToTest() {
    const toCreate: { model: ITodoModelCreation, node: Pick<INodeCreation, 'text' | 'type'> }[] = [
        {
            model: {
                name: "model",
                user_id: user.id
            },
            node: {
                text: "node",
                type: "action"
            },
        },
        {
            model: {
                name: "other model",
                user_id: user2.id
            },
            node: {
                text: "other node",
                type: "action"
            }
        },
        {
            model: {
                name: "published model",
                published: true,
                user_id: user.id
            },
            node: {
                text: "published node",
                type: "action"
            }
        },
        {
            model: {
                name: "other published model",
                published: true,
                user_id: user2.id
            },
            node: {
                text: "other published node",
                type: "action"
            }
        }
    ]

    const [
        {
            model,
            node
        },
        {
            model: otherModel,
            node: otherNode
        },
        {
            model: publishedModel,
            node: publishedNode
        },
        {
            model: otherPublishedModel,
            node: otherPublishedNode
        }
    ] = await Promise.all(toCreate.map(async ({model, node}) => {
        const modelElem = await TodoModel.create(model)
        const nodeElem = await Node.create({
            ...node,
            model_id: modelElem.id
        })
        return {model: modelElem, node: nodeElem}
    }))

    return {model, node, otherModel, otherNode, publishedModel, publishedNode, otherPublishedModel, otherPublishedNode};
}

describe("Tests update nodes", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let publishedModel: TodoModel;
    let publishedNode: Node;
    let otherPublishedModel: TodoModel;
    let otherPublishedNode: Node;
    let otherModel: TodoModel;
    let otherNode: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        const elems = await createNodesToTest();

        model = elems.model;
        node = elems.node;
        publishedModel = elems.publishedModel;
        publishedNode = elems.publishedNode;
        otherModel = elems.otherModel;
        otherNode = elems.otherNode;
        otherPublishedModel = elems.otherPublishedModel;
        otherPublishedNode = elems.otherPublishedNode;
    });

    afterAll(() => t.rollback());

    test("Put with bad fields", () => {
        return request(app)
            .put("/nodes/" + node.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                text: 12,
                type: 'abcd'
            })
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        violations: [
                            {
                                "message": "Le texte doit faire entre 2 et 150 caractères",
                                "propertyPath": "text",
                            },
                            {
                                "message": "Le type ne peut être que 'question' ou 'action'",
                                "propertyPath": "type",
                            },
                        ]
                    }
                })
            )
    })

    test("Put with missing fields", () => {
        return request(app)
            .put("/nodes/" + node.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        violations: [
                            {
                                "message": "Champs 'text' non spécifié",
                                "propertyPath": "text",
                            },
                            {
                                "message": "Champs 'type' non spécifié",
                                "propertyPath": "type",
                            },
                        ]
                    }
                })
            )
    })

    test("Put on published model node", () => {
        return request(app)
            .put("/nodes/" + publishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Put on other node", () => {
        return request(app)
            .put("/nodes/" + otherNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Put on other published node", () => {
        return request(app)
            .put("/nodes/" + otherPublishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Put node successfully", () => {
        const toUpdate = {
            text: "question node",
            type: "question"
        }
        return request(app)
            .put("/nodes/" + node.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send(toUpdate)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    model: Node,
                    toCheck: (jsonRes) => ({
                        ...toUpdate,
                        id: node.id,
                        model_id: model.id,
                        model: {
                            ...compileDataValues(model),
                            createdAt: jsonRes ? model.createdAt.toISOString() : model.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        }
                    }),
                    include: nodeIncludeModel
                })
            )
    })

    test("Patch node type with error", () => {
        return request(app)
            .patch("/nodes/" + node.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                type: "ananas"
            })
            .then(res =>
                expectElem({
                    res,
                    code: 422,
                    checkDbElem: false,
                    toCheck: {
                        violations: [
                            {
                                "message": "Le type ne peut être que 'question' ou 'action'",
                                "propertyPath": "type",
                            }
                        ]
                    }
                })
            )
    })

    test("Patch node successfully", () => {
        return Promise.all([
            {
                field: 'text',
                value: 'bonjour'
            }, {
                field: 'type',
                value: 'action'
            }
        ].map(({field, value}) =>
            request(app)
                .patch("/nodes/" + node.id)
                .set('Authorization', 'Bearer ' + jwt)
                .send({
                    [field]: value
                })
                .then(res =>
                    expectElem({
                        res,
                        code: 200,
                        model: Node,
                        include: nodeIncludeModel,
                        toCheck: (jsonRes) => ({
                            id: node.id,
                            text: field === 'text' ? value : expect.any(String),
                            type: field === 'type' ? value : expect.any(String),
                            model_id: model.id,
                            model: {
                                ...compileDataValues(model),
                                createdAt: jsonRes ? model.createdAt.toISOString() : model.createdAt,
                                updatedAt: expect.any(jsonRes ? String : Date)
                            }
                        })
                    })
                )
        ))
    })
})

describe("Test get node", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let publishedModel: TodoModel;
    let publishedNode: Node;
    let otherPublishedModel: TodoModel;
    let otherPublishedNode: Node;
    let otherModel: TodoModel;
    let otherNode: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        const elems = await createNodesToTest();

        model = elems.model;
        node = elems.node;
        publishedModel = elems.publishedModel;
        publishedNode = elems.publishedNode;
        otherModel = elems.otherModel;
        otherNode = elems.otherNode;
        otherPublishedModel = elems.otherPublishedModel;
        otherPublishedNode = elems.otherPublishedNode;
    });

    afterAll(() => t.rollback());

    test("Get own non published node", () => {
        return request(app)
            .get("/nodes/" + node.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: {
                        ...compileDataValues(node),
                        model: {
                            ...compileDataValues(model),
                            createdAt: model.createdAt.toISOString(),
                            updatedAt: model.updatedAt.toISOString()
                        }
                    }
                })
            )
    })

    test("Get own published node", () => {
        return request(app)
            .get("/nodes/" + publishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: {
                        ...compileDataValues(publishedNode),
                        model: {
                            ...compileDataValues(publishedModel),
                            createdAt: publishedModel.createdAt.toISOString(),
                            updatedAt: publishedModel.updatedAt.toISOString()
                        }
                    }
                })
            )
    })

    test("Get other published node", () => {
        return request(app)
            .get("/nodes/" + otherPublishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: {
                        ...compileDataValues(otherPublishedNode),
                        model: {
                            ...compileDataValues(otherPublishedModel),
                            createdAt: otherPublishedModel.createdAt.toISOString(),
                            updatedAt: otherPublishedModel.updatedAt.toISOString()
                        }
                    }
                })
            )
    })

    test("Get other non published node", () => {
        return request(app)
            .get("/nodes/" + otherNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })
});

describe("Tests delete nodes", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let publishedModel: TodoModel;
    let publishedNode: Node;
    let otherPublishedModel: TodoModel;
    let otherPublishedNode: Node;
    let otherModel: TodoModel;
    let otherNode: Node;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        const elems = await createNodesToTest();

        model = elems.model;
        node = elems.node;
        publishedModel = elems.publishedModel;
        publishedNode = elems.publishedNode;
        otherModel = elems.otherModel;
        otherNode = elems.otherNode;
        otherPublishedModel = elems.otherPublishedModel;
        otherPublishedNode = elems.otherPublishedNode;
    });

    afterAll(() => t.rollback());

    test("Delete own non published node", () => {
        return request(app)
            .delete("/nodes/" + node.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 204,
                    checkBody: false,
                    model: Node,
                    id: node.id,
                    toCheck: null
                })
            )
    })

    test("Delete own published node", () => {
        return request(app)
            .delete("/nodes/" + publishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Delete other node", () => {
        return request(app)
            .delete("/nodes/" + otherNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Delete other published node", () => {
        return request(app)
            .delete("/nodes/" + otherPublishedNode.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })
})