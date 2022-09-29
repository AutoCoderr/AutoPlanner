import User from "../models/User";
import request from "supertest";
import app from "../app";
import sequelize from "../sequelize";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Todo from "../models/Todo";
import Step from "../models/Step";
import Folder from "../models/Folder";
import getJsonList from "../libs/tests/getJsonList";
import compileDataValues from "../libs/compileDatavalues";
import expectElem from "../libs/tests/expectElem";
import {TodoWithAssociatedSteps} from "../interfaces/models/Todo";
import {FolderWithAssociatedSteps} from "../interfaces/models/Folder";

const getTodoAndFolderListJson = getJsonList<Todo| Folder>((todoOrFolder) => ({
    ...compileDataValues(todoOrFolder),
    deadLine: todoOrFolder.deadLine?.toISOString()??null,
    createdAt: todoOrFolder.createdAt.toISOString(),
    updatedAt: todoOrFolder.updatedAt.toISOString()
}));

let user: User;
let user2: User;
let jwt;


beforeAll(async () => {
    user = await User.create({
        username: "testStepAssociations",
        email: "testStepAssociations@test.com",
        password: "1234"
    });

    user2 = await User.create({
        username: "testStepAssociations2",
        email: "testStepAssociations2@test.com",
        password: "1234"
    });


    jwt = await request(app)
        .post("/account/login")
        .send({
            usernameOrEmail: "testStepAssociations",
            password: "1234"
        })
        .then(res => JSON.parse(res.text).access_token);
});

afterAll(async () => {
    await user.destroy();
    await user2.destroy();
    await sequelize.close();
})

describe("Tests create delete and list steps associations", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let folder: Folder;
    let todo: Todo;
    let step: Step;

    let model2: TodoModel;
    let node2: Node;
    let folder2: Folder;
    let todo2: Todo;
    let step2: Step;

    let todoToAssociate: Todo;
    let todoToAssociate2: Todo;
    let folderToAssociate: Folder;
    let subTodo: Todo;
    let subFolder: Folder;
    let folderToAssociate2: Folder;


    let otherModel: TodoModel;
    let otherNode: Node;
    let otherTodo: Todo;
    let otherStep: Step

    let otherTodoToAssociate: Todo;
    let otherFolderToAssociate: Folder;


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
        folder = await Folder.create({
            name: "folder",
            user_id: user.id
        });
        todo = await Todo.create({
            name: "todo",
            user_id: user.id,
            model_id: model.id,
            parent_id: folder.id
        });
        step = await Step.create({
            node_id: node.id,
            todo_id: todo.id
        });

        model2 = await TodoModel.create({
           name: "model 2",
           user_id: user.id
        });
        node2 = await Node.create({
            text: "node 2",
            type: "action",
            model_id: model2.id
        });
        folder2 = await Folder.create({
            name: "folder 2",
            user_id: user.id
        });
        todo2 = await Todo.create({
            name: "todo 2",
            user_id: user.id,
            parent_id: folder2.id,
            model_id: model2.id
        })
        step2 = await Step.create({
            node_id: node2.id,
            todo_id: todo2.id
        })

        todoToAssociate = await Todo.create({
            name: "todo to associate",
            deadLine: new Date('2022-11-10'),
            user_id: user.id
        });
        folderToAssociate = await Folder.create({
            name: "folder to associate",
            user_id: user.id
        });
        subTodo = await Todo.create({
            name: "sub todo",
            user_id: user.id,
            parent_id: folderToAssociate.id
        });
        subFolder = await Folder.create({
            name: "sub folder",
            user_id: user.id,
            parent_id: folderToAssociate.id
        });
        todoToAssociate2 = await Todo.create({
            name: "todo to associate",
            deadLine: new Date('2022-10-10'),
            priority: 3,
            user_id: user.id
        });
        folderToAssociate2 = await Folder.create({
            name: "folder to associate",
            priority: 2,
            user_id: user.id
        });


        otherModel = await TodoModel.create({
            name: "other model",
            user_id: user2.id
        });
        otherNode = await Node.create({
            text: "other node",
            type: "action",
            model_id: otherModel.id
        });
        otherTodo = await Todo.create({
            name: "other todo",
            user_id: user2.id,
            model_id: otherModel.id
        });
        otherStep = await Step.create({
            todo_id: otherTodo.id,
            node_id: otherNode.id
        });
        otherTodoToAssociate = await Todo.create({
            name: "other todo to associate",
            user_id: user2.id
        });
        otherFolderToAssociate = await Folder.create({
            name: "other folder to associate",
            user_id: user2.id
        })
    });

    afterAll(() => t.rollback());

    test("Associate other todo and folder to other step", () => {
        return Promise.all([
            ['todos',otherTodoToAssociate.id],
            ['folders',otherFolderToAssociate.id]
        ].map(([accesser,id]) =>
            request(app)
                .post("/steps/"+otherStep.id+"/"+accesser+"/"+id)
                .set('Authorization', 'Bearer ' + jwt)
                .then(res => {
                    expect(res.statusCode).toEqual(403)
                })
        ))
    });

    test("Associate other todo and folder to own step", () => {
        return Promise.all([
            ['todos',otherTodoToAssociate.id],
            ['folders',otherFolderToAssociate.id]
        ].map(([accesser,id]) =>
            request(app)
                .post("/steps/"+step.id+"/"+accesser+"/"+id)
                .set('Authorization', 'Bearer ' + jwt)
                .then(res => {
                    expect(res.statusCode).toEqual(403)
                })
        ))
    });

    test("Associate own todo and folder to other step", () => {
        return Promise.all([
            ['todos',todoToAssociate.id],
            ['folders',folderToAssociate.id]
        ].map(([accesser,id]) =>
            request(app)
                .post("/steps/"+otherStep.id+"/"+accesser+"/"+id)
                .set('Authorization', 'Bearer ' + jwt)
                .then(res => {
                    expect(res.statusCode).toEqual(403)
                })
        ))
    });

    test("Associate step todo to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+todo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409)
            })
    });

    test("Associate step todo folder to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409)
            })
    });

    test("Associate todo to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+todoToAssociate.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Re Associate todo to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+todoToAssociate.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409);
            })
    })

    test("Associate todo2 to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+todoToAssociate2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Associate folder to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folderToAssociate.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    })

    test("Re Associate folder to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folderToAssociate.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409);
            })
    })

    test("Associate subFolder to step, with folder already associated", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+subFolder.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409);
            })
    });

    test("Associate subtodo to step, with folder already associated", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+subTodo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409);
            })
            .then(async () => {
                await folderToAssociate.removeAssociatedStep(step);
                await subTodo.addAssociatedStep(step);
            })
    });

    test("Associate folder to step, with subTodo already associated", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folderToAssociate.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409);
            })
            .then(async () => {
                await subTodo.removeAssociatedStep(step)
                await folderToAssociate.addAssociatedStep(step)
            })
    });

    test("Associate folder2 to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folderToAssociate2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201);
            })
    });

    // Infinite loop : todo2 -> step -> todo -> folder -> step2 -> todo2
    test("add folder into step2, and add todo2 in step", async () => {
        await folder.addAssociatedStep(step2)

        return request(app)
            .post("/steps/"+step.id+"/todos/"+todo2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409)
            })
    })

    // Infinite loop : folder2 -> step -> todo -> folder -> step2 -> todo2 -> folder2
    test("Add folder2 to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/folders/"+folder2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409)
            })
    })

    // Infinite loop : folder2 -> step -> todo -> folder -> folder2
    test("Remove folder from step2, add folder to folder2, and add folder2 to step", async () => {
        await folder.removeAssociatedStep(step2);
        folder.parent_id = folder2.id;
        await folder.save();

        return request(app)
            .post("/steps/"+step.id+"/folders/"+folder2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(409)
            })
    })

    // No infinite loop : todo2 -> step -> todo -> folder -> folder2
    test("Add todo2 to step", () => {
        return request(app)
            .post("/steps/"+step.id+"/todos/"+todo2.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(201)
            })
            .then(async () => {
                await todo2.removeAssociatedStep(step);
                folder.parent_id = null;
                await folder.save();
            })
    })

    test("Get associated todos", () => {
        return request(app)
            .get("/steps/"+step.id+"/todos")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoAndFolderListJson(todoToAssociate,todoToAssociate2)
                })
            )
    });

    test("Get associated todos order by deadLine", () => {
        return request(app)
            .get("/steps/"+step.id+"/todos?asc=deadLine")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoAndFolderListJson(todoToAssociate2,todoToAssociate)
                })
            )
    });

    test("Get associated todos with priority 3", () => {
        return request(app)
            .get("/steps/"+step.id+"/todos?priority=3")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoAndFolderListJson(todoToAssociate2)
                })
            )
    });

    test("Get associated folders", () => {
        return request(app)
            .get("/steps/"+step.id+"/folders")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoAndFolderListJson(folderToAssociate,folderToAssociate2)
                })
            )
    });

    test("Get associated folders with priority 2", () => {
        return request(app)
            .get("/steps/"+step.id+"/folders?priority=2")
            .set('Authorization', 'Bearer ' + jwt)
            .then(res =>
                expectElem({
                    res,
                    code: 200,
                    checkDbElem: false,
                    toCheck: getTodoAndFolderListJson(folderToAssociate2)
                })
            )
    });

    test("delete unassociated subTodo from step", () => {
        request(app)
            .delete("/steps/"+step.id+"/todos/"+subTodo.id)
            .set('Authorization', 'Bearer ' + jwt)
            .then(res => {
                expect(res.statusCode).toEqual(404);
            })
    });

    test("Delete associated todo 1 and associated folder 2 from step", () => {
        return Promise.all([
            ['todos',todoToAssociate.id],
            ['folders', folderToAssociate2.id]
        ].map(([accesser,id]) =>
            request(app)
                .delete("/steps/"+step.id+"/"+accesser+"/"+id)
                .set('Authorization', 'Bearer ' + jwt)
                .then(res =>
                    expectElem({
                        res,
                        code: 204,
                        checkBody: false,
                        getter: () =>
                            (<Promise<TodoWithAssociatedSteps|FolderWithAssociatedSteps|null>>(accesser === 'todos' ?
                                Todo.findOne({
                                    where: {
                                        id: todoToAssociate.id
                                    },
                                    include: {
                                        model: Step,
                                        as: "associatedSteps"
                                    }
                                }) :
                                Folder.findOne({
                                    where: {
                                        id: folderToAssociate2.id
                                    },
                                    include: {
                                        model: Step,
                                        as: "associatedSteps"
                                    }
                                })))
                                .then((todoOrFolder) => todoOrFolder ? todoOrFolder.associatedSteps : null),
                        toCheck: []
                    })
                )
        ));
    })

})