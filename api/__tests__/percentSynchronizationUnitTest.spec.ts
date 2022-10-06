import User from "../models/User";
import sequelize from "../sequelize";
import Folder from "../models/Folder";
import Todo from "../models/Todo";
import rand from "../libs/rand";
import calculSynchronizedFolderPercent from "../libs/percentSynchronization/calculSynchronizedFolderPercent";
import calculSynchronizedStepPercent from "../libs/percentSynchronization/calculSynchronizedStepPercent";
import calculSynchronizedTodoPercent from "../libs/percentSynchronization/calculSynchronizedTodoPercent";
import Step from "../models/Step";
import Node from "../models/Node";
import TodoModel from "../models/TodoModel";
import round from "../libs/round";

let user: User;


beforeAll(async () => {
    user = await User.create({
        username: "testPercentSyncUnit",
        email: "testPercentSyncUnit@test.com",
        password: "1234"
    });
});

afterAll(async () => {
    await user.destroy();
    await sequelize.close();
})

describe("Test folder synchronization unitary", () => {
    let t;

    let folder: Folder;

    let folderA: Folder;

    let folderB: Folder;

    let todoA: Todo;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folder = await Folder.create({
            name: "folder",
            percentSynchronized: true,
            user_id: user.id
        });

        folderA = await Folder.create({
            name: "folderA",
            percent: rand(0,100),
            parent_id: folder.id,
            user_id: user.id
        });


        folderB = await Folder.create({
            name: "folderB",
            percent: rand(0,100),
            parent_id: folder.id,
            user_id: user.id
        });

        todoA = await Todo.create({
            name: "todoA",
            percent: rand(0,100),
            parent_id: folder.id,
            user_id: user.id
        });
    });

    afterAll(() => t.rollback());

    test("Calcul folder synchronized percent", async () => {
        expect(await calculSynchronizedFolderPercent(folder))
            .toEqual(round(
                (
                    (
                        folderA.percent + folderB.percent + todoA.percent
                    ) / 300
                ) * 100, 3)
            )
    })
});


describe("Test step synchronization unitary", () => {
    let t;

    let model: TodoModel;
    let node: Node;
    let todo: Todo;

    let step: Step;

    let todoA: Todo;
    let todoB: Todo;
    let folderA: Folder;

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
            user_id: user.id,
            model_id: model.id
        });

        step = await Step.create({
            percentSynchronized: true,
            node_id: node.id,
            todo_id: todo.id
        });

        todoA = await Todo.create({
            name: "todo A",
            percent: rand(0,100),
            user_id: user.id
        });
        todoB = await Todo.create({
            name: "todo B",
            percent: rand(0,100),
            user_id: user.id
        });
        folderA = await Folder.create({
            name: "folder A",
            percent: rand(0,100),
            user_id: user.id
        });

        await step.addAssociatedTodo(todoA);
        await step.addAssociatedTodo(todoB);
        await step.addAssociatedFolder(folderA);
    })

    afterAll(() => t.rollback());


    test("Calcul step synchronized percent", async () => {
        expect(await calculSynchronizedStepPercent(step))
            .toEqual(round((
                    (
                        todoA.percent + todoB.percent + folderA.percent
                    ) / 300
                ) * 100, 3)
            )
    })
});

describe("Test todo synchronization unitary", () => {
    let t;

    let model: TodoModel;
    let todo: Todo;

    let nodeA: Node;
    let nodeB: Node;
    let nodeC: Node;
    let nodeD: Node;

    let nodeDA: Node;

    let nodeDB: Node;
    let nodeDBA: Node;

    let nodeDC: Node;

    let nodeDD: Node;
    let nodeDDA: Node;
    let nodeDDB: Node;

    let nodeDE: Node;
    let nodeDEA: Node;
    let nodeDEB: Node;
    let nodeDEC: Node;


    let stepNodeA1: Step;

    let stepNodeB1: Step;
    let stepNodeB2: Step;

    let stepNodeC1: Step;
    let stepNodeC2: Step;

    let stepNodeD1: Step;

    let stepNodeDC1: Step;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });

        nodeA = await Node.create({
            text: "node A",
            type: "action",
            model_id: model.id
        });
        model.firstnode_id = nodeA.id;
        await model.save();

        nodeB = await Node.create({
            text: "node B",
            type: "action",
            model_id: model.id
        });
        await nodeA.addChild(nodeB);

        nodeC = await Node.create({
            text: "node C",
            type: "action",
            model_id: model.id
        });
        await nodeB.addChild(nodeC);

        nodeD = await Node.create({
            text: "node D",
            type: "question",
            model_id: model.id
        });
        await nodeC.addChild(nodeD);
        await nodeD.addChild(nodeB);

        nodeDA = await Node.create({
            text: "node DA",
            type: "action",
            model_id: model.id
        });
        await nodeD.addChild(nodeDA);

        nodeDB = await Node.create({
            text: "node DB",
            type: "action",
            model_id: model.id
        });
        await nodeD.addChild(nodeDB);

        nodeDBA = await Node.create({
            text: "node DBA",
            type: "action",
            model_id: model.id
        });
        await nodeDB.addChild(nodeDBA);

        nodeDC = await Node.create({
            text: "node DC",
            type: "action",
            model_id: model.id
        });
        await nodeD.addChild(nodeDC);
        await nodeDC.addChild(nodeB);

        nodeDD = await Node.create({
            text: "node DD",
            type: "action",
            model_id: model.id
        });
        await nodeD.addChild(nodeDD);

        nodeDDA = await Node.create({
            text: "node DDA",
            type: "action",
            model_id: model.id
        });
        await nodeDD.addChild(nodeDDA);

        nodeDDB = await Node.create({
            text: "node DDB",
            type: "action",
            model_id: model.id
        });
        await nodeDDA.addChild(nodeDDB);
        await nodeDDB.addChild(nodeB);

        nodeDE = await Node.create({
            text: "node DE",
            type: "action",
            model_id: model.id
        });
        await nodeD.addChild(nodeDE);

        nodeDEA = await Node.create({
            text: "node DEA",
            type: "action",
            model_id: model.id
        });
        await nodeDE.addChild(nodeDEA);

        nodeDEB = await Node.create({
            text: "node DEB",
            type: "action",
            model_id: model.id
        });
        await nodeDEA.addChild(nodeDEB);

        nodeDEC = await Node.create({
            text: "node DEC",
            type: "action",
            model_id: model.id
        });
        await nodeDEB.addChild(nodeDEC);
        await nodeDEC.addChild(nodeDEA);

        todo = await Todo.create({
            name: "todo",
            percentSynchronized: true,
            user_id: user.id,
            model_id: model.id
        });


        stepNodeA1 = await Step.create({
            percent: rand(0,100),
            node_id: nodeA.id,
            todo_id: todo.id
        });
        stepNodeB1 = await Step.create({
            percent: rand(0,100),
            node_id: nodeB.id,
            todo_id: todo.id
        });
        stepNodeC1 = await Step.create({
            percent: rand(0,100),
            node_id: nodeC.id,
            todo_id: todo.id
        });
        stepNodeD1 = await Step.create({
            percent: rand(0,100),
            node_id: nodeD.id,
            todo_id: todo.id
        });
        stepNodeDC1 = await Step.create({
            percent: rand(0,100),
            node_id: nodeDA.id,
            todo_id: todo.id
        });

        stepNodeB2 = await Step.create({
            percent: rand(0,100),
            node_id: nodeB.id,
            todo_id: todo.id
        });
        stepNodeC2 = await Step.create({
            percent: rand(0,100),
            node_id: nodeC.id,
            todo_id: todo.id
        });
    })

    afterAll(() => t.rollback());

    test("Calcul todo synchronized percent", async () => {
        expect(
            await calculSynchronizedTodoPercent(todo)
        ).toEqual(
            round(((stepNodeA1.percent + stepNodeB2.percent + stepNodeC2.percent) / (5.5 * 100)) * 100, 3)
        )
    })
});