import migrate from "../libs/migrate";
import sequelize from "../sequelize";
import Folder from "../models/Folder";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Response from "../models/Response";
import Todo from "../models/Todo";
import Step from "../models/Step";
import User from "../models/User";
import {
    findOneFolderByIdWithFolders,
    findOneFolderByIdWithParent,
    findOneFolderByIdWithTodos
} from "../repositories/FolderRepository";
import {
    findOneNodeByIdWithChildren,
    findOneNodeByIdWithChildrenAndResponses,
    findOneNodeByIdWithModel, findOneNodeByIdWithParents
} from "../repositories/NodeRepository";
import {findOneTodoByIdWithParent} from "../repositories/TodoRepository";
import {findOneStepByIdWithAssociatedTodosAndFolders} from "../repositories/StepRepository";
import {IUser} from "../interfaces/models/User";

let user: IUser;
let t;


beforeAll(async () => {
    await migrate()

    t = await sequelize.transaction();
    sequelize.constructor['_cls'] = new Map();
    sequelize.constructor['_cls'].set('transaction', t);

    user = await User.create({
        username: "test",
        email: "test@test.com",
        password: "1234"
    })
})

afterAll(async () => {
    await t.rollback();
    return sequelize.close();
})

describe("Test models to check database coherence", () => {
    test("Test creating folders and show then, to check oneToMany relation on one model", async () => {
        const parent = await Folder.create({
            name: "Je suis le parent",
            user_id: user.id
        });

        const child1 = await Folder.create({
            name: "Enfant 1",
            user_id: user.id,
            deadLine: new Date()
        })
        child1.parent_id = parent.id;
        await child1.save();

        const child2 = await Folder.create({
            name: "Enfant 2",
            user_id: user.id
        })
        await child2.setParent(parent);

        const child3 = await Folder.create({
            name: "Enfant 3",
            user_id: user.id
        })
        await parent.addFolder(child3);

        const parent_get2 = await findOneFolderByIdWithFolders(parent.id);

        const child1_get2 = await findOneFolderByIdWithParent(child1.id);
        
        expect(parent_get2?.folders).toEqual([
            {
                "id": expect.any(Number),
                "name": "Enfant 1",
                "description": null,
                "percent": null,
                "percentSynchronized": false,
                "priority": 1,
                "createdAt": expect.any(Date),
                "updatedAt": expect.any(Date),
                "deadLine": child1.deadLine,
                "parent_id": parent.id,
                "user_id": user.id
            },
            {
                "id": expect.any(Number),
                "name": "Enfant 2",
                "description": null,
                "percent": null,
                "percentSynchronized": false,
                "priority": 1,
                "createdAt": expect.any(Date),
                "updatedAt": expect.any(Date),
                "deadLine": null,
                "parent_id": parent.id,
                "user_id": user.id
            },
            {
                "id": expect.any(Number),
                "name": "Enfant 3",
                "description": null,
                "percent": null,
                "percentSynchronized": false,
                "priority": 1,
                "createdAt": expect.any(Date),
                "updatedAt": expect.any(Date),
                "deadLine": null,
                "parent_id": parent.id,
                "user_id": user.id
            }
        ])
        
        expect(child1_get2?.parent).toEqual({
            "id": expect.any(Number),
            "name": "Je suis le parent",
            "description": null,
            "percent": null,
            "percentSynchronized": false,
            "priority": 1,
            "createdAt": expect.any(Date),
            "updatedAt": expect.any(Date),
            "deadLine": null,
            "parent_id": null,
            "user_id": user.id
        })
    });


    test("Test tree model", async () => {
        const model = await TodoModel.create({
            name: "Test",
            user_id: user.id
        })

        const node1 = await Node.create({
            text: "Acheter du pain",
            type: "action",
            model_id: model.id
        });
        
        await model.setFirstNode(node1);

        const searchedNode1 = await findOneNodeByIdWithModel(node1.id);
        
        expect(searchedNode1?.model).toEqual({
            id: model.id,
            name: 'Test',
            description: null,
            published: false,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date), 
            firstnode_id: searchedNode1?.id,
            user_id: user.id
        })

        const node2 = await Node.create({
            text: "Manger des pâtes",
            type: "action", 
            model_id: model.id
        })
        
        await node2.addParent(node1);

        const searchedNode1_2 = await findOneNodeByIdWithChildren(node1.id)
        
        expect(searchedNode1_2?.children).toEqual([
            { 
                id: node2.id,
                text: 'Manger des pâtes',
                type: 'action', 
                model_id: model.id,
                RelationNode: expect.any(Object)
            }
        ])

        const question = await Node.create({
            text: "Fait-il beau ?",
            type: "question", 
            model_id: model.id
        })
        
        await node2.addChild(question);

        const searchedNode2 = await findOneNodeByIdWithChildren(node2.id);

        
        expect(searchedNode2?.children).toEqual([
            { 
                id: question.id,
                text: 'Fait-il beau ?',
                type: 'question', 
                model_id: model.id,
                RelationNode: expect.any(Object)
            }
        ])

        const actionResponse1 = await Node.create({
            text: "Alors sort",
            type: "action", 
            model_id: model.id
        })
        await actionResponse1.addParent(question);
        const response1 = await Response.create({
            text: "Oui", 
            question_id: question.id, 
            action_id: actionResponse1.id
        })

        const actionResponse2 = await Node.create({
            text: "Alors sort pas",
            type: "action", 
            model_id: model.id
        })
        await actionResponse2.addParent(question);
        const response2 = await Response.create({
            text: "Non", 
            question_id: question.id, 
            action_id: actionResponse2.id
        })

        const searchedQuestion = await findOneNodeByIdWithChildrenAndResponses(question.id);

        expect(searchedQuestion).toEqual({
            id: searchedQuestion?.id,
            text: 'Fait-il beau ?',
            type: 'question', 
            model_id: model.id,
            responses: [
                { 
                    id: response1.id,
                    text: 'Oui', 
                    question_id: question.id,
                    action_id: actionResponse1.id
                },
                { 
                    id: response2.id,
                    text: 'Non',
                    question_id: question.id,
                    action_id: actionResponse2.id
                }
            ],
            children: [
                { 
                    id: actionResponse1.id,
                    text: 'Alors sort',
                    type: 'action', 
                    model_id: model.id,
                    RelationNode: expect.any(Object)
                },
                { 
                    id: actionResponse2.id,
                    text: 'Alors sort pas',
                    type: 'action', 
                    model_id: model.id,
                    RelationNode: expect.any(Object)
                }
            ]
        })

        const lastAction = await Node.create({
            text: "Dormir",
            type: "action", 
            model_id: model.id
        }); 
        await actionResponse1.addChild(lastAction); 
        await actionResponse2.addChild(lastAction);

        const searchedActionResponse1 = await findOneNodeByIdWithChildren(actionResponse1.id);
        
        expect(searchedActionResponse1?.children).toEqual([
            { 
                id: lastAction.id,
                text: 'Dormir',
                type: 'action', 
                model_id: model.id,
                RelationNode: { 
                    child_id: lastAction.id, 
                    parent_id: searchedActionResponse1?.id
                }
            }
        ])

        const searchedLastAction = await findOneNodeByIdWithParents(lastAction.id);
        
        expect(searchedLastAction?.parents).toEqual([
            { 
                id: actionResponse1.id,
                text: 'Alors sort',
                type: 'action', 
                model_id: model.id,
                RelationNode: { 
                    child_id: searchedLastAction?.id,
                    parent_id: actionResponse1.id
                }
            },
            { 
                id: actionResponse2.id,
                text: 'Alors sort pas',
                type: 'action', 
                model_id: model.id,
                RelationNode: { 
                    child_id: searchedLastAction?.id,
                    parent_id: actionResponse2.id
                }
            }
        ])
    });

    test("Test todo in folder", async () => {
        const folder = await Folder.create({
            name: "Folder test",
            user_id: user.id
        });

        const todo = await Todo.create({
            name: "Todo test", 
            parent_id: folder.id,
            deadLine: new Date(),
            user_id: user.id
        })

        const searchTodo = await findOneTodoByIdWithParent(todo.id);
        
        expect(searchTodo?.parent).toEqual({
            id: folder.id,
            name: 'Folder test',
            description: null,
            percent: null,
            percentSynchronized: false,
            priority: 1,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            deadLine: null,
            parent_id: null,
            user_id: user.id
        })

        const searchedFolder = await findOneFolderByIdWithTodos(folder.id);

        expect(searchedFolder?.todos).toEqual([
            { 
                id: todo.id,
                name: 'Todo test',
                description: null,
                percent: 0,
                priority: 1,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                deadLine: todo.deadLine,
                model_id: null, 
                parent_id: folder.id,
                user_id: user.id
            }
        ])
    });

    test("Test relation folder and todos to step in a todo", async () => {
        const model = await TodoModel.create({
            name: "Test model 2",
            user_id: user.id
        });

        const node = await Node.create({
            text: "Node 1",
            type: "action", 
            model_id: model.id
        });
        
        await model.setFirstNode(node);

        const todo = await Todo.create({
            name: "Todo test", 
            model_id: model.id,
            user_id: user.id
        });

        const step = await Step.create({ 
            node_id: node.id, 
            todo_id: todo.id,
            deadLine: new Date()
        });


        const otherTodo1 = await Todo.create({
            name: "other todo1",
            user_id: user.id
        });
        const otherTodo2 = await Todo.create({
            name: "other todo2",
            user_id: user.id
        });
        const otherFolder = await Folder.create({
            name: "other folder",
            user_id: user.id
        });

        
        await step.addAssociatedTodo(otherTodo1);
        await step.addAssociatedTodo(otherTodo2);
        await step.addAssociatedFolder(otherFolder);

        const searchedStep = await findOneStepByIdWithAssociatedTodosAndFolders(step.id);

        expect(searchedStep).toEqual({
            id: step.id,
            percent: 0,
            percentSynchronized: false,
            nb: 1,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            deadLine: step.deadLine,
            node_id: node.id,
            todo_id: todo.id,
            associatedTodos: [
                {
                    id: otherTodo1.id,
                    name: 'other todo1',
                    description: null,
                    percent: 0,
                    priority: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    deadLine: null,
                    model_id: null,
                    parent_id: null,
                    user_id: user.id,
                    RelationStepTodo: { 
                        step_id: step.id,
                        todo_id: otherTodo1.id
                    }
                },
                {
                    id: otherTodo2.id,
                    name: 'other todo2',
                    description: null,
                    percent: 0,
                    priority: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    deadLine: null,
                    model_id: null,
                    parent_id: null,
                    user_id: user.id,
                    RelationStepTodo: { 
                        step_id: step.id,
                        todo_id: otherTodo2.id
                    }
                }
            ],
            associatedFolders: [
                { 
                    id: otherFolder.id,
                    name: 'other folder',
                    description: null,
                    percent: null,
                    percentSynchronized: false,
                    priority: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    deadLine: null,
                    parent_id: null,
                    user_id: user.id,
                    RelationStepFolder: { 
                        step_id: step.id,
                        folder_id: otherFolder.id
                    }
                }
            ]
        })
    });
})