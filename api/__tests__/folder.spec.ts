import request from "supertest";
import User from "../models/User";
import app from "../app";
import sequelize from "../sequelize";
import Folder from "../models/Folder";
import expectElem from "../libs/expectElem";

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testFolder",
        email: "testFolder@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testFolder2",
        email: "testFolder2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testFolder",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})

describe("Test folder creation", () => {
    let t;

    let folderParent: Folder;
    let badFolderParent: Folder;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folderParent = await Folder.create({
            name: "parent",
            user_id: user.id
        });
        badFolderParent = await Folder.create({
            name: "bad parent",
            user_id: user2.id
        });
    });

    afterAll(() => t.rollback());

    test("Create folder without connection",() => {
        return request(app)
            .post("/folders")
            .send({
                name: "coucou"
            })
            .then(res => {
                expect(res.statusCode).toEqual(401);
            })
    });

    test("Create folder with bad fields", () => {
        return request(app)
            .post("/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                description: "Coucou les gens",
                percent: -12,
                priority: 2.5,
                percentSynchronized: true,
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
                            "propertyPath": "percent",
                            "message": "Vous devez rentrer un nombre entre 0 et 100"
                        },
                        {
                            "propertyPath": "priority",
                            "message": "Vous devez rentrer un entier entre 1 et 5"
                        }
                    ]
                })
            })
    })

    test("Create successfully folder", () => {
        return request(app)
            .post("/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Test",
                description: "Je suis un dossier",
                percent: 12,
                priority: 4
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "Test",
                    description: "Je suis un dossier",
                    percent: 12,
                    priority: 4,
                    percentSynchronized: false,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null
                })
            })
    })

    test("Create successfully folder with percentSynchronized", () => {
        return request(app)
            .post("/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Test",
                percent: 12,
                percentSynchronized: true,
            })
            .then(res => {
                expect(res.statusCode).toEqual(201);
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "Test",
                    description: null,
                    percent: 12,
                    priority: 1,
                    percentSynchronized: true,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null
                })
            })
    })

    test("Create folder with parent of other user", () => {
        return request(app)
            .post("/folders/"+badFolderParent.id+"/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Test"
            })
            .then(res => {
                expect(res.statusCode).toEqual(403)
            })
    })

    test("Create folder successfully with parent", () => {
        return request(app)
            .post("/folders/"+folderParent.id+"/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Test"
            })
            .then(res => {
                expect(res.statusCode).toEqual(201)
                expect(JSON.parse(res.text)).toEqual({
                    id: expect.any(Number),
                    name: "Test",
                    description: null,
                    percent: null,
                    priority: 1,
                    percentSynchronized: false,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: folderParent.id
                })
            })
    })
})

describe("Tests get all", () => {
    let t;

    let otherFolder: Folder;

    let folder1: Folder;
    let folder2: Folder;

    let folder1A: Folder;
    let folder1B: Folder;

    let folder2A: Folder;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        otherFolder = await Folder.create({
            name: "Other folder",
            user_id: user2.id
        });
        folder1 = await Folder.create({
            name: "folder1",
            user_id: user.id
        });
        folder2 = await Folder.create({
            name: "folder2",
            priority: 3,
            user_id: user.id
        })
        folder1A = await Folder.create({
            name: "folder1A",
            user_id: user.id,
            parent_id: folder1.id
        })
        folder1B = await Folder.create({
            name: "folder1B",
            user_id: user.id,
            parent_id: folder1.id
        })
        folder2A = await Folder.create({
            name: "folder2A",
            user_id: user.id,
            parent_id: folder2.id
        })
    })

    afterAll(() => t.rollback())

    test("Get all folders on other user", () => {
        return request(app)
            .get("/folders/"+otherFolder.id+"/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    });

    test("Get all folders of user", () => {
        return request(app)
            .get("/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual([folder1,folder2].map(({id,name, priority}) => ({
                    id,
                    name,
                    description: null,
                    percent: null,
                    percentSynchronized: false,
                    priority,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: null
                })))
            })
    });

    test("Get all folders of folder1", () => {
        return request(app)
            .get("/folders/"+folder1.id+"/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual([folder1A,folder1B].map(({id,name}) => ({
                    id,
                    name,
                    description: null,
                    percent: null,
                    percentSynchronized: false,
                    priority: 1,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: folder1.id
                })))
            })
    })
    test("Get all folders of folder2", () => {
        return request(app)
            .get("/folders/"+folder2.id+"/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(200)
                expect(JSON.parse(res.text)).toEqual([folder2A].map(({id,name}) => ({
                    id,
                    name,
                    description: null,
                    percent: null,
                    percentSynchronized: false,
                    priority: 1,
                    deadLine: null,
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: folder2.id
                })))
            })
    })
    test("Get folders with priority 3", () => {
        return request(app)
            .get("/folders?priority=3")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: [folder2].map(({id,name}) => ({
                        id,
                        name,
                        description: null,
                        percent: null,
                        percentSynchronized: false,
                        priority: 3,
                        deadLine: null,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        user_id: user.id,
                        parent_id: null
                    }))
                })
            )
    })
})

describe("Tests update folder", () => {
    let t;

    let badParentFolder: Folder;
    let parentFolder: Folder;

    let folder: Folder;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        badParentFolder = await Folder.create({
            name: "Bad parent",
            user_id: user2.id
        })
        parentFolder = await Folder.create({
            name: "Parent",
            user_id: user.id
        })

        folder = await Folder.create({
            name: "folder test",
            description: "coucou",
            priority: 4,
            user_id: user.id
        });
    });

    afterAll(() => t.rollback())

    test("Put folder with bad fields", () => {
        return request(app)
            .put("/folders/"+folder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                description: 12,
                percentSynchronized: "abc",
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
                            "message": "La description doit faire entre 2 et 200 caractères"
                        },
                        {
                            "propertyPath": "percentSynchronized",
                            "message": "Vous devez rentrer un booléen"
                        }
                    ]
                })
            })
    })

    test("Put folder1 into parent of other user", () => {
        return request(app)
            .put("/folders/"+folder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Modified",
                description: "coucou",
                priority: 2,
                parent_id: badParentFolder.id
            })
            .then(res => {
                expect(res.statusCode).toEqual(422);
                expect(JSON.parse(res.text)).toEqual({
                    "violations": [
                        {
                            "propertyPath": "parent_id",
                            "message": "Dossier parent mal mentionné"
                        }
                    ]
                })
            })
    });

    test("Put folder", () => {
        return request(app)
            .put("/folders/"+folder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                name: "Modified",
                description: "coucou",
                percentSynchronized: true,
                priority: 2,
                parent_id: parentFolder.id,
                deadLine: "2050/12/12"
            })
            .then(res => {
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.text)).toEqual({
                    id: folder.id,
                    name: "Modified",
                    description: "coucou",
                    percent: null,
                    percentSynchronized: true,
                    priority: 2,
                    deadLine: new Date("2050/12/12").toISOString(),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user_id: user.id,
                    parent_id: parentFolder.id
                })
            })
    })

    test("Patch folder with bad parent", () => {
        return request(app)
            .patch("/folders/"+folder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .send({
                parent_id: 123456789
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

    test("Patch folder", async () => {
        const toPatch = {
            description: "Ananas",
            percent: 52,
            priority: 1,
            percentSynchronized: true,
            parent_id: null,
            deadLine: null
        };
        const toMatch = {
            id: expect.any(Number),
            name: "Folder to patch",
            description: "coucou",
            percent: null,
            percentSynchronized: false,
            priority: 4,
            deadLine: new Date("2050/12/12").toISOString(),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            user_id: user.id,
            parent_id: parentFolder.id,
        }

        const foldersToPatchByField: [string,Folder][] = await Promise.all(Object.entries(toPatch).map(async ([field]) => [
            field,
            await Folder.create({
                name: "Folder to patch",
                user_id: user.id,
                description: "coucou",
                parent_id: parentFolder.id,
                priority: 4,
                deadLine: new Date("2050/12/12")
            })
        ]))

        return Promise.all(
            foldersToPatchByField.map(([field, folder]) =>
                request(app)
                    .patch("/folders/"+parentFolder.id+"/folders/"+folder.id)
                    .set('Authorization', 'Bearer ' + jwt)
                    .send({
                        [field]: toPatch[field]
                    })
                    .then(res => {
                        expect(res.statusCode).toEqual(200)
                        expect(JSON.parse(res.text)).toEqual({
                            ...toMatch,
                            [field]: toPatch[field]
                        })
                    })

            )
        )
    })
})

describe("Tests delete folder", () => {
    let t;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);
    })

    afterAll(() => t.rollback())

    test("Delete folder on other user", async () => {
        const badFolder = await Folder.create({
            name: "coucou",
            user_id: user2.id
        })

        return request(app)
            .delete("/folders/"+badFolder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(403);
            })
    })

    test("Delete folder", async () => {
        const folder = await Folder.create({
            name: "coucou",
            user_id: user.id
        })

        return request(app)
            .delete("/folders/"+folder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(204);
            })
    })
})
