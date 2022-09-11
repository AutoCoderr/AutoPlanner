import request from "supertest";
import app from "../app";
import sequelize from "../sequelize";
import User from "../models/User";
import Todo from "../models/Todo";
import Folder from "../models/Folder";
import getJsonList from "../libs/getJsonList";
import compileDataValues from "../libs/compileDatavalues";
import expectElem from "../libs/expectElem";

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testTodo",
        email: "testTodo@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testTodo2",
        email: "testTodo2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testTodo",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})

const getTodoListJson = getJsonList<Todo>(todo => ({
    ...compileDataValues(todo),
    deadLine: todo.deadLine?.toISOString()??null,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString()
}))

describe("Test get all todos", () => {
    let t;

    let folder: Folder;

    let todo1: Todo;
    let todo2: Todo;
    let todo3: Todo;
    let todo4: Todo;
    let todo5: Todo;
    let todo6: Todo;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folder = await Folder.create({
            name: "folder",
            user_id: user.id
        });

        todo1 = await Todo.create({
            name: 'todo1',
            percent: 49,
            deadLine: new Date("2022-07-12"),
            user_id: user.id
        });
        todo2 = await Todo.create({
            name: 'ananas',
            percent: 12,
            deadLine: new Date("2022-05-14"),
            user_id: user.id
        });
        todo3 = await Todo.create({
            name: "todo3",
            description: "ananas",
            percent: 58,
            deadLine: new Date("2022-09-25"),
            user_id: user.id
        });
        todo4 = await Todo.create({
            name: "todo4",
            percent: 35,
            deadLine: new Date("2022-01-18"),
            user_id: user.id
        });
        todo5 = await Todo.create({
            name: "todo5",
            percent: 70,
            deadLine: new Date("2022-06-19"),
            user_id: user.id
        });
        todo6 = await Todo.create({
            name: "todo6",
            user_id: user2.id
        });
    });

    afterAll(() => t.rollback());

    test("Get all todos", () => {
        return request(app)
            .get("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoListJson(todo1,todo2,todo3,todo4,todo5)
                })
            )
    })

    test("Get todos which contains 'ananas'", () => {
        return request(app)
            .get("/todos?search=ananas")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoListJson(todo2,todo3)
                })
            )
    })

    test("Get todos which has more than 100%", () => {
        return request(app)
            .get("/todos?percent=50,100")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoListJson(todo3,todo5)
                })
            )
    })

    test("Get todos which has deadline in jun and july 2022", () => {
        return request(app)
            .get("/todos?deadLine=2022-06-01,2022-07-31&asc=deadLine")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoListJson(todo5,todo1)
                })
            )
    })
})

describe("Test get all todos in folder", () => {
    let t;

    let folder: Folder;
    let badFolder: Folder;

    let todoF1: Todo;
    let todoF2: Todo;

    let todo1: Todo;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folder = await Folder.create({
            name: "test",
            user_id: user.id
        });
        badFolder = await Folder.create({
            name: "test",
            user_id: user2.id
        })

        todoF1 = await Todo.create({
            name: "test",
            parent_id: folder.id,
            user_id: user.id
        })
        todoF2 = await Todo.create({
            name: "test",
            parent_id: folder.id,
            user_id: user.id
        })

        todo1 = await Todo.create({
            name: "test",
            user_id: user.id
        })
    })

    afterAll(() => t.rollback())


    test("Get all todos on user root", () => {
        return request(app)
            .get("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.text)).toEqual([todo1].map(({id, name}) => ({
                    id,
                    name,
                    description: null,
                    percent: 0,
                    priority: 1,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    model_id: null,
                    parent_id: null
                })));
            })
    })

    test("Get all todos on folder", () => {
        return request(app)
            .get("/folders/"+folder.id+"/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.text)).toEqual([todoF1,todoF2].map(({id, name}) => ({
                    id,
                    name,
                    description: null,
                    percent: 0,
                    priority: 1,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    model_id: null,
                    parent_id: folder.id
                })));
            })
    })

    test("Get all todos on bad folder", () => {
        return request(app)
            .get("/folders/"+badFolder.id+"/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })
})

describe("Test todos create", () => {
    let t;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);
    })

    afterAll(() => t.rollback());

    test("Create todo without connection", () => {
        return request(app)
            .post("/todos")
            .then(res => {
                expect(res.statusCode).toEqual(401);
            })
    });
    test("Create todo with missing name", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "name",
                            "message": "Champs 'name' non spécifié"
                        }
                    ]
                });
            })
    })
    test("Create todo with bad fields", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                "name": "Manger des bananes",
                "description": 12,
                "priority": "abcd",
                "deadLine": "coucou"
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "description",
                            "message": "Le description doit faire entre 2 et 200 caractères"
                        },
                        {
                            "propertyPath": "priority",
                            "message": "Vous devez rentrer un entier entre 1 et 5"
                        },
                        {
                            "propertyPath": "deadLine",
                            "message": "Vous avez rentré une date invalide"
                        }
                    ]
                });
            })
    })

    test("Create todo successfully with only name", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                "name": "Manger des bananes",
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "Manger des bananes",
                    description: null,
                    percent: 0,
                    priority: 1,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null,
                    model_id: null
                })
            })
    })
    test("Create todo successfully with all fields", () => {
        return request(app)
            .post("/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                "name": "Manger des bananes",
                "description": "C'est plein de potatium",
                "priority": 2,
                "deadLine": "2022/09/10"
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "Manger des bananes",
                    description: "C'est plein de potatium",
                    percent: 0,
                    priority: 2,
                    deadLine: new Date("2022/09/10").toISOString(),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null,
                    model_id: null
                })
            })
    })
});

describe("Tests create todos in folder", () => {
    let t;

    let folder: Folder;
    let badFolder: Folder;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folder = await Folder.create({
            name: "folder",
            user_id: user.id
        });
        badFolder = await Folder.create({
            name: "bad folder",
            user_id: user2.id
        })
    })

    afterAll(() => t.rollback());

    test("Create todo in bad folder", () => {
        return request(app)
            .post("/folders/"+badFolder.id+"/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "test"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Create todo in folder", () => {
        return request(app)
            .post("/folders/"+folder.id+"/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "test"
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "test",
                    description: null,
                    percent: 0,
                    priority: 1,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: folder.id,
                    model_id: null
                })
            })
    })
})

describe("Tests get todo", () => {
    let t;
    let todo: Todo;
    let badTodo: Todo;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        todo = await Todo.create({
            name: "Manger des bananes",
            description: "C'est plein de potatium",
            priority: 2,
            deadLine: new Date("2022/09/10"),
            user_id: user.id
        });

        badTodo = await Todo.create({
            name: "Manger des bananes",
            description: "C'est plein de potatium",
            priority: 2,
            deadLine: new Date("2022/09/10"),
            user_id: user2.id
        })
    })

    afterAll(() => t.rollback());


    test("Get non exist todo", () => {
        return request(app)
            .get("/todos/123456789")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(404);
            })
    })

    test("Get bad todo", () => {
        return request(app)
            .get("/todos/" + badTodo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403)
            });
    })

    test("Get todo", () => {
        return request(app)
            .get("/todos/" + todo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual({
                    id: todo.id,
                    name: "Manger des bananes",
                    description: "C'est plein de potatium",
                    percent: 0,
                    priority: 2,
                    deadLine: new Date("2022/09/10").toISOString(),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null,
                    model_id: null
                })
            })
    });
})

describe("Test update todo", () => {
    let t;

    let todo: Todo;

    let folder: Folder;
    let badFolder: Folder;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folder = await Folder.create({
            name: "Folder",
            user_id: user.id
        })
        badFolder = await Folder.create({
            name: "Bad folder",
            user_id: user2.id
        })

        todo = await Todo.create({
            name: "Manger des bananes",
            description: "C'est plein de potatium",
            priority: 2,
            deadLine: new Date("2022/09/10"),
            user_id: user.id,
            parent_id: folder.id
        })
    })

    afterAll(() => t.rollback());

    test("Put todo with bad fields", () => {
        return request(app)
            .put("/todos/"+todo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                "description": 12,
                "priority": "abcd",
                "deadLine": "coucou"
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "name",
                            "message": "Champs 'name' non spécifié"
                        },
                        {
                            "propertyPath": "description",
                            "message": "Le description doit faire entre 2 et 200 caractères"
                        },
                        {
                            "propertyPath": "priority",
                            "message": "Vous devez rentrer un entier entre 1 et 5"
                        },
                        {
                            "propertyPath": "deadLine",
                            "message": "Vous avez rentré une date invalide"
                        }
                    ]
                });
            })
    })

    test("Put todo, with bad parent", () => {
        return request(app)
            .put("/todos/"+todo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Coucou",
                parent_id: badFolder.id
            })
            .then(res => {
                expect(res.statusCode).toEqual(422)
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "parent_id",
                            "message": "Dossier parent mal mentionné"
                        }
                    ]
                })
            })
    })

    test("Put todo successfully", () => {
        return request(app)
            .put("/todos/"+todo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                "name": "Coucou",
                "priority": 5,
                "deadLine": null,
                "parent_id": null
            })
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.text)).toEqual({
                    id: todo.id,
                    name: "Coucou",
                    description: "C'est plein de potatium",
                    percent: 0,
                    priority: 5,
                    deadLine: null,
                    createdAt: todo.createdAt.toISOString(),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null,
                    model_id: null
                })
            })
    })

    test("Patch todo with bad parent", () => {
        return request(app)
            .patch("/todos/"+todo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                parent_id: "ze6e56"
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "parent_id",
                            "message": "Données irrécupérables"
                        }
                    ]
                });
            })
    })

    test("Patch todo", async () => {
        const toPatch = {
            description: "Ananas",
            percent: 99,
            priority: 1,
            parent_id: folder.id,
            deadLine: "2050/12/12"
        };
        const toMatch = {
            id: expect.any(Number),
            name: "Todo to patch",
            description: "coucou",
            percent: expect.any(Number),
            priority: 4,
            deadLine: null,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            user_id: user.id,
            parent_id: null,
            model_id: null
        }

        const todosToPatchByField: [string,Todo][] = await Promise.all(Object.entries(toPatch).map(async ([field]) => [
            field,
            await Todo.create({
                name: "Todo to patch",
                user_id: user.id,
                description: "coucou",
                priority: 4
            })
        ]))

        return Promise.all(todosToPatchByField.map(([field,todo]) =>
            request(app)
                .patch("/todos/"+todo.id)
                .set('Authorization', 'Bearer ' + jwt)
                .send({
                    [field]: toPatch[field]
                })
                .then(res => {
                    expect(res.statusCode).toEqual(200)
                    expect(JSON.parse(res.text)).toEqual({
                        ...toMatch,
                        [field]: field === "deadLine" ? new Date(toPatch[field]).toISOString() : toPatch[field]
                    })
                })
        ))
    });
})

describe("Test delete todos", () => {
    let t;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);
    })

    afterAll(() => t.rollback())

    test("delete todo", async () => {
        const todoId = await Todo.create({
            name: "Manger des bananes",
            description: "C'est plein de potatium",
            priority: 2,
            deadLine: new Date("2022/09/10"),
            user_id: user.id
        }).then(todo => todo.id);

        return request(app)
            .delete("/todos/"+todoId)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(204);
            })
    })
})