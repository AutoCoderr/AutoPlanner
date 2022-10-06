import User from "../models/User";
import sequelize from "../sequelize";
import request from "supertest";
import app from "../app";
import Folder from "../models/Folder";
import Todo from "../models/Todo";
import rand from "../libs/rand";
import expectElem from "../libs/tests/expectElem";
import compileDataValues from "../libs/compileDatavalues";
import detectAndSynchronizeSteps from "../libs/percentSynchronization/detectAndSynchronizeSteps";
import detectAndSynchronizeStepTodo from "../libs/percentSynchronization/detectAndSynchronizeStepTodo";
import detectAndSynchronizeTodoAndFolderParent
    from "../libs/percentSynchronization/detectAndSynchronizeTodoAndFolderParent";
import round from "../libs/round";
import TodoModel from "../models/TodoModel";
import Step from "../models/Step";
import Node from "../models/Node";

let user: User;
let jwt;

beforeAll(async () => {
    user = await User.create({
        username: "testPercentSync",
        email: "testPercentSync@test.com",
        password: "1234"
    });

    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testPercentSync",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);

    return Promise.all([
        detectAndSynchronizeSteps(),
        detectAndSynchronizeStepTodo(),
        detectAndSynchronizeTodoAndFolderParent()
    ])
});

afterAll(async () => {
    await user.destroy();
    await sequelize.close();
})

describe("Test parent folder synchronization", () => {
    let t;

    let parent: Folder;
    let parent2: Folder;

    let folder1: Folder;
    let folder2: Folder;
    let folder3: Folder;
    let todo1: Todo;
    let todo2: Todo;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        parent = await Folder.create({
            name: "parent",
            user_id: user.id
        });

        parent2 = await Folder.create({
            name: "parent2",
            percentSynchronized: true,
            user_id: user.id
        });

        folder1 = await Folder.create({
            name: "folder 1",
            percent: rand(0,100),
            user_id: user.id,
            parent_id: parent.id
        });
        todo1 = await Todo.create({
            name: "todo 1",
            percent: rand(0,100),
            user_id: user.id,
            parent_id: parent.id
        });
    });

    afterAll(() => t.rollback());

    test("Set percentSynchronized to true", () => {
        return request(app)
            .patch("/folders/"+parent.id)
            .send({
                percentSynchronized: true
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                parent = await expectElem({
                    res,
                    code: 200,
                    model: Folder,
                    toCheck: jsonRes => ({
                        ...compileDataValues(parent),
                        percentSynchronized: true,
                        percent: round(((folder1.percent + todo1.percent) / 200) * 100, 3),
                        createdAt: jsonRes ? parent.createdAt.toISOString() : parent.createdAt,
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })
            })
    })

    test("update folderA1 and todoA1 percent", async () => {
        for (const [accesser, entity, percent] of [
            ['folders', folder1, rand(0,100)],
            ['todos', todo1, rand(0,100)]
        ]) {
            await request(app)
                .patch("/"+accesser+"/"+entity.id)
                .send({
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async res => {
                    await expectElem({
                        res,
                        code: 200,
                        model: accesser === "folders" ? Folder : Todo,
                        toCheck: jsonRes => ({
                            ...compileDataValues(entity),
                            percent,
                            createdAt: jsonRes ? entity.createdAt.toISOString() : entity.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        })
                    })

                    await entity.reload();

                    await parent.reload();

                    expect(parent.percent).toEqual(round(((folder1.percent + todo1.percent) / 200) * 100, 3))
                })
        }
    })

    test("update folderA and todoA percent with percentSynchronized to false", async () => {
        parent.percentSynchronized = false;
        await parent.save();

        const existingPercent = parent.percent;

        for (const [accesser, id, percent] of [
            ['folders', folder1.id, rand(0,100)],
            ['todos', todo1.id, rand(0,100)]
        ]) {
            await request(app)
                .patch("/"+accesser+"/"+id)
                .send({
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async res => {
                    const entity = accesser === "folders" ? folder1 : todo1;
                    const computedRes = await expectElem({
                        res,
                        code: 200,
                        model: accesser === "folders" ? Folder : Todo,
                        toCheck: jsonRes => ({
                            ...compileDataValues(entity),
                            percent,
                            createdAt: jsonRes ? entity.createdAt.toISOString() : entity.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        })
                    })

                    if (accesser === "folders") {
                        folder1 = computedRes
                    } else {
                        todo1 = computedRes;
                    }

                    await parent.reload();

                    expect(parent.percent).toEqual(existingPercent)
                })
        }
    })

    test("Create a new todo and folder with percentSynchronized to false", () => {
        const existingPercent = parent.percent;
        return Promise.all([
            ['todo', rand(0,100)],
            ['folder', rand(0,100)]
        ].map(([type, percent]) =>
            request(app)
                .post('/folders/'+parent.id+"/"+type+"s")
                .send({
                    name: type,
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async res => {
                    const computedRes = await expectElem({
                        res,
                        code: 201,
                        model: type === 'todo' ? Todo : Folder,
                        toCheck: jsonRes => ({
                            id: expect.any(Number),
                            name: type,
                            description: null,
                            percent,
                            percentSynchronized: false,
                            priority: 1,
                            deadLine: null,
                            createdAt: expect.any(jsonRes ? String : Date),
                            updatedAt: expect.any(jsonRes ? String : Date),
                            parent_id: parent.id,
                            user_id: user.id,
                            ...(
                                type === "todo" ?
                                    {
                                        model_id: null
                                    } : {}
                            )
                        })
                    });

                    if (type === "todo")
                        todo2 = computedRes;
                    else
                        folder2 = computedRes;

                    await parent.reload();
                    expect(parent.percent).toEqual(existingPercent)
                })
        ))
            .then(async () => {
                await Promise.all([todo2,folder2].map(m => m.destroy()));
                parent.percentSynchronized = true;
                await parent.save();
            })
    })

    test("Create todo2, with percentSynchronized to true", () => {
        const percent = rand(0,100);
        return request(app)
            .post("/folders/"+parent.id+"/todos")
            .send({
                name: "todo2",
                percent
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async (res) => {
                todo2 = await expectElem({
                    res,
                    code: 201,
                    model: Todo,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        name: "todo2",
                        description: null,
                        percent,
                        percentSynchronized: false,
                        priority: 1,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        parent_id: parent.id,
                        user_id: user.id,
                        model_id: null
                    })
                })

                await parent.reload();
                expect(parent.percent)
                    .toEqual(
                        round(((todo1.percent + todo2.percent + folder1.percent) / 300) * 100, 3)
                    )
            })
    })

    test("Create folder2, with percentSynchronized to true", () => {
        const percent = rand(0,100);
        return request(app)
            .post("/folders/"+parent.id+"/folders")
            .send({
                name: "folder2",
                percent
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async (res) => {
                folder2 = await expectElem({
                    res,
                    code: 201,
                    model: Folder,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        name: "folder2",
                        description: null,
                        percent,
                        percentSynchronized: false,
                        priority: 1,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        parent_id: parent.id,
                        user_id: user.id
                    })
                })

                await parent.reload();
                expect(parent.percent)
                    .toEqual(
                        round(((todo1.percent + todo2.percent + folder1.percent + folder2.percent) / 400) * 100, 3)
                    )
            })
    })

    test("Create folder3, with percentSynchronized to true", () => {
        return request(app)
            .post("/folders/"+parent.id+"/folders")
            .send({
                name: "folder3"
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async (res) => {
                folder3 = await expectElem({
                    res,
                    code: 201,
                    model: Folder,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        name: "folder3",
                        description: null,
                        percent: null,
                        percentSynchronized: false,
                        priority: 1,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        parent_id: parent.id,
                        user_id: user.id
                    })
                })

                await parent.reload();

                expect(parent.percent)
                    .toEqual(
                        round(((todo1.percent + todo2.percent + folder1.percent + folder2.percent) / 500) * 100, 3)
                    )
            })
    })

    test("Test delete folder2, with percentSynchronized to true", () => {
        return request(app)
            .delete("/folders/"+folder2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(204);

                await parent.reload();
                expect(parent.percent)
                    .toEqual(
                        round(((todo1.percent + todo2.percent + folder1.percent) / 400) * 100, 3)
                    )
            })
    })
    test("Test delete todo2, with percentSynchronized to true", () => {
        return request(app)
            .delete("/todos/"+todo2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(204);

                await parent.reload();
                expect(parent.percent)
                    .toEqual(
                        round(((todo1.percent + folder1.percent) / 300) * 100, 3)
                    )
            })
    })

    test("Test change todo1 parent", () => {
        return request(app)
            .patch("/todos/"+todo1.id)
            .send({
                parent_id: parent2.id
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                todo1 = await expectElem({
                    res,
                    code: 200,
                    model: Todo,
                    toCheck: jsonRes => ({
                        ...compileDataValues(todo1),
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date),
                        parent_id: parent2.id
                    })
                });

                await parent.reload();
                expect(parent.percent)
                    .toEqual(
                        round(((folder1.percent) / 200) * 100, 3)
                    )

                await parent2.reload();
                expect(parent2.percent)
                    .toEqual(
                        round(todo1.percent, 3)
                    )
            })
    })
})

describe("Test step synchronisation", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let todo: Todo;

    let step: Step;
    let todo1: Todo;
    let todo2: Todo;
    let folder1: Folder;
    let folder2: Folder;
    let folder3: Folder;


    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });

        node = await Node.create({
            text: "node",
            type: "action",
            model_id: model.id
        });
        model.firstnode_id = node.id;
        await model.save();

        todo = await Todo.create({
            name: "todo",
            model_id: model.id,
            user_id: user.id
        });


        step = await Step.create({
            node_id: node.id,
            todo_id: todo.id
        });

        todo1 = await Todo.create({
            name: "todo1",
            percent: rand(0,100),
            user_id: user.id
        });
        todo2 = await Todo.create({
            name: "todo2",
            percent: rand(0,100),
            user_id: user.id
        });
        folder1 = await Folder.create({
            name: "folder1",
            percent: rand(0,100),
            user_id: user.id
        });
        folder2 = await Folder.create({
            name: "folder2",
            percent: rand(0,100),
            user_id: user.id
        });
        folder3 = await Folder.create({
            name: "folder3",
            user_id: user.id
        });


        await todo1.addAssociatedStep(step);
        await folder1.addAssociatedStep(step);
    });

    afterAll(() => t.rollback());

    test("Set step percentSynchronized to true", () => {
        return request(app)
            .patch("/steps/"+step.id)
            .send({
                percentSynchronized: true
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                step = await expectElem({
                    res,
                    code: 200,
                    model: Step,
                    toCheck: jsonRes => ({
                        ...compileDataValues(step),
                        createdAt: jsonRes ? step.createdAt.toISOString() : step.createdAt,
                        updatedAt: expect.any(jsonRes ? String : Date),
                        percentSynchronized: true,
                        percent: round(((todo1.percent + folder1.percent) / 200) * 100, 3)
                    })
                })
            })
    });

    test("Update todo1 and folder1 percents, with percentSynchronized to true", async () => {
        for (const [type, entity, percent] of [
            ['todo', todo1, rand(0,100)],
            ['folder', folder1, rand(0,100)]
        ]) {
            await request(app)
                .patch("/"+type+"s/"+entity.id)
                .send({
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async res => {
                    await expectElem({
                        res,
                        code: 200,
                        model: type === 'todo' ? Todo : Folder,
                        toCheck: jsonRes => ({
                            ...compileDataValues(entity),
                            percent,
                            createdAt: jsonRes ? entity.createdAt.toISOString() : entity.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        })
                    })

                    await entity.reload();
                    await step.reload();

                    expect(step.percent)
                        .toEqual(
                            round(((todo1.percent + folder1.percent) / 200) * 100, 3)
                        )
                })
        }
    })

    test("Update todo1 and folder1 percents, with percentSynchronized to false", async () => {
        const existingPercent = step.percent;

        step.percentSynchronized = false;
        await step.save();


        for (const [type, entity, percent] of [
            ['todo', todo1, rand(0,100)],
            ['folder', folder1, rand(0,100)]
        ]) {
            await request(app)
                .patch("/"+type+"s/"+entity.id)
                .send({
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async res => {
                    await expectElem({
                        res,
                        code: 200,
                        model: type === 'todo' ? Todo : Folder,
                        toCheck: jsonRes => ({
                            ...compileDataValues(entity),
                            percent,
                            createdAt: jsonRes ? entity.createdAt.toISOString() : entity.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        })
                    })

                    await entity.reload();
                    await step.reload();

                    expect(step.percent)
                        .toEqual(existingPercent)
                })
        }
    })

    test("Create todo2 and folder2 to step, with percentSynchronized to false", async () => {
        const existingPercent = step.percent;

        for (const [type,entity] of <[string,Todo|Folder][]>[
            ['todo', todo2],
            ['folder', folder2]
        ]) {
            await request(app)
                .post("/steps/"+step.id+"/"+type+"s/"+entity.id)
                .set('Authorization', 'Bearer ' + jwt)
                .then(async res => {
                    expect(res.statusCode).toEqual(201);

                    await step.reload();

                    expect(step.percent).toEqual(existingPercent)
                })
        }

        await todo2.removeAssociatedStep(step);
        await folder2.removeAssociatedStep(step);

        step.percentSynchronized = true;
        await step.save();
    })

    test("Create todo2 to step, with percentSynchronized to true", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+todo2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(201);

                await step.reload();

                expect(step.percent).toEqual(round(
                    ((todo1.percent + todo2.percent + folder1.percent) / 300) * 100
                , 3))
            })
    })

    test("Create folder2 to step, with percentSynchronized to true", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folder2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(201);

                await step.reload();

                expect(step.percent).toEqual(round(
                    ((todo1.percent + todo2.percent + folder1.percent + folder2.percent) / 400) * 100
                    , 3))
            })
    })

    test("Create folder3 to step, with percentSynchronized to true", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folder3.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(201);

                await step.reload();

                expect(step.percent).toEqual(round(
                    ((todo1.percent + todo2.percent + folder1.percent + folder2.percent) / 500) * 100
                    , 3))
            })
    })

    test("delete folder2 from step, with percentSynchronized to true", () => {
        return request(app)
            .delete("/steps/"+step.id+"/folders/"+folder2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(204);

                await step.reload();

                expect(step.percent).toEqual(round(
                    ((todo1.percent + todo2.percent + folder1.percent) / 400) * 100
                    , 3))
            })
    })

    test("delete todo2 from database, with percentSynchronized to true", () => {
        return request(app)
            .delete("/todos/"+todo2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(204);

                await step.reload();

                expect(step.percent).toEqual(round(
                    ((todo1.percent + folder1.percent) / 300) * 100
                    , 3))
            })
    })
})

describe("Test todos synchronization", () => {
    let t;

    let model: TodoModel;

    let nodeA: Node;
    let nodeB: Node;
    let nodeC: Node;
    let nodeD: Node;
    let nodeE: Node;

    let todo: Todo;
    let stepA: Step;
    let stepB: Step;
    let stepC: Step;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);


        model = await TodoModel.create({
            name: "mode",
            user_id: user.id
        });

        nodeA = await Node.create({
            text: "nodeA",
            type: "action",
            model_id: model.id
        });
        model.firstnode_id = nodeA.id;
        await model.save();

        nodeB = await Node.create({
            text: "nodeB",
            type: "action",
            model_id: model.id
        });
        await nodeA.addChild(nodeB);

        nodeC = await Node.create({
            text: "nodeC",
            type: "action",
            model_id: model.id
        });
        await nodeB.addChild(nodeC);

        nodeD = await Node.create({
            text: "nodeD",
            type: "action",
            model_id: model.id
        });
        await nodeC.addChild(nodeD);

        nodeE = await Node.create({
            text: "nodeE",
            type: "action",
            model_id: model.id
        });
        await nodeD.addChild(nodeE);


        todo = await Todo.create({
            name: "todo",
            user_id: user.id,
            model_id: model.id
        })

        stepA = await Step.create({
            node_id: nodeA.id,
            todo_id: todo.id,
            percent: rand(0,100)
        })

        stepB = await Step.create({
            node_id: nodeB.id,
            todo_id: todo.id,
            percent: rand(0,100)
        })
    })

    afterAll(() => t.rollback());

    test("Set percentSynchronized to true", () => {
        return request(app)
            .patch("/todos/"+todo.id)
            .send({
                percentSynchronized: true
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                todo = await expectElem({
                    res,
                    code: 200,
                    model: Todo,
                    toCheck: jsonRes => ({
                        ...compileDataValues(todo),
                        percentSynchronized: true,
                        percent: round(((stepA.percent + stepB.percent) / 500) * 100, 3),
                        createdAt: jsonRes ? todo.createdAt.toISOString() : todo.createdAt,
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })
            })
    })

    test("update stepB and stepC, with percentSynchronized to true", async () => {
        for (const [entity, percent] of [
            [stepA, rand(0,100)],
            [stepB, rand(0,100)]
        ]) {
            await request(app)
                .patch("/steps/"+entity.id)
                .send({
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async (res) => {
                    await expectElem({
                        res,
                        code: 200,
                        model: Step,
                        toCheck: jsonRes => ({
                            ...compileDataValues(entity),
                            percent,
                            createdAt: jsonRes ? entity.createdAt.toISOString() : entity.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        })
                    })
                    await entity.reload();
                    await todo.reload();

                    expect(todo.percent)
                        .toEqual(
                            round(((stepA.percent + stepB.percent) / 500) * 100, 3)
                        )
                })
        }
    })

    test("update stepB and stepC, with percentSynchronized to false", async () => {
        const existingPercent = todo.percent;

        todo.percentSynchronized = false;
        await todo.save();

        for (const [entity, percent] of [
            [stepA, rand(0,100)],
            [stepB, rand(0,100)]
        ]) {
            await request(app)
                .patch("/steps/"+entity.id)
                .send({
                    percent
                })
                .set('Authorization', 'Bearer ' + jwt)
                .then(async (res) => {
                    await expectElem({
                        res,
                        code: 200,
                        model: Step,
                        toCheck: jsonRes => ({
                            ...compileDataValues(entity),
                            percent,
                            createdAt: jsonRes ? entity.createdAt.toISOString() : entity.createdAt,
                            updatedAt: expect.any(jsonRes ? String : Date)
                        })
                    })
                    await entity.reload();
                    await todo.reload();

                    expect(todo.percent).toEqual(existingPercent)
                })
        }
    })

    test("Create stepC, with percentSynchronized to false", () => {
        const existingPercent = todo.percent;
        const percent = rand(0,100);
        return request(app)
            .post("/todos/"+todo.id+"/steps")
            .send({
                percent,
                parent_node: nodeB.id
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                stepC = await expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent,
                        percentSynchronized: false,
                        node_id: nodeC.id,
                        todo_id: todo.id,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })

                await todo.reload();
                expect(todo.percent).toEqual(existingPercent);
            })
    })

    test("Delete stepC, with percentSynchronized to false", async () => {
        const existingPercent = rand(0,100);
        todo.percent = existingPercent;
        await todo.save();

        return request(app)
            .delete("/steps/"+stepC.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(204);

                await todo.reload();
                expect(todo.percent).toEqual(existingPercent);
            })
    })

    test("Create stepC, with percentSynchronized to true", async () => {
        todo.percentSynchronized = true;
        await todo.save();

        const percent = rand(0,100);
        return request(app)
            .post("/todos/"+todo.id+"/steps")
            .send({
                percent,
                parent_node: nodeB.id
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                stepC = await expectElem({
                    res,
                    code: 201,
                    model: Step,
                    toCheck: jsonRes => ({
                        id: expect.any(Number),
                        percent,
                        percentSynchronized: false,
                        node_id: nodeC.id,
                        todo_id: todo.id,
                        deadLine: null,
                        createdAt: expect.any(jsonRes ? String : Date),
                        updatedAt: expect.any(jsonRes ? String : Date)
                    })
                })

                await todo.reload();
                expect(todo.percent).toEqual(round(((stepA.percent + stepB.percent + stepC.percent) / 500) * 100, 3));
            })
    })

    test("Delete stepC, with percentSynchronized to true", () => {
        return request(app)
            .delete("/steps/"+stepC.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(async res => {
                expect(res.statusCode).toEqual(204);

                await todo.reload();
                expect(todo.percent).toEqual(round(((stepA.percent + stepB.percent) / 500) * 100, 3));
            })
    })
})

describe("Test multi synchronization", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let node2: Node;
    let todo: Todo;
    let step: Step;

    let folder: Folder;
    let subFolder: Folder;
    let subTodo: Todo;
    let subStep: Step;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });
        node = await Node.create({
            text: "node",
            type: "action",
            model_id: model.id
        });
        model.firstnode_id = node.id;
        await model.save();
        node2 = await Node.create({
            text: "node2",
            type: "action",
            model_id: model.id
        });
        await node.addChild(node2);

        todo = await Todo.create({
            name: "todo",
            percentSynchronized: true,
            user_id: user.id,
            model_id: model.id
        });
        step = await Step.create({
            percentSynchronized: true,
            node_id: node.id,
            todo_id: todo.id
        });

        folder = await Folder.create({
            name: "folder",
            percentSynchronized: true,
            user_id: user.id
        });
        await step.addAssociatedFolder(folder);

        subFolder = await Folder.create({
            name: "sub folder",
            percentSynchronized: true,
            user_id: user.id,
            parent_id: folder.id
        });

        subTodo = await Todo.create({
            name: "sub todo",
            percentSynchronized: true,
            user_id: user.id,
            parent_id: subFolder.id,
            model_id: model.id
        });

        subStep = await Step.create({
            node_id: node.id,
            todo_id: subTodo.id
        })
    })

    afterAll(() => t.rollback());

    test("Define subStep percent, and check all other synchronized percents", () => {
        const percent = rand(50,100);
        const subTodoPercent = round((percent / 200) * 100, 3);
        const todoPercent = round((subTodoPercent / 200) * 100, 3);

        return request(app)
            .patch('/steps/'+subStep.id)
            .send({
                percent
            })
            .set('Authorization', 'Bearer ' + jwt)
            .then((res) =>
                expectElem({
                    res,
                    code: 200,
                    async getter() {
                        const models = [subStep, subTodo, subFolder, folder, step, todo];
                        await Promise.all(models.map(m => m.reload()))
                        return models.map(m => m.percent);
                    },
                    toCheck: jsonRes => jsonRes ? {
                        ...compileDataValues(subStep),
                        percent,
                        createdAt: subStep.createdAt.toISOString(),
                        updatedAt: expect.any(String)
                    } : [
                        percent,
                        subTodoPercent,
                        subTodoPercent,
                        subTodoPercent,
                        subTodoPercent,
                        todoPercent
                    ]
                })
            )
    })
})