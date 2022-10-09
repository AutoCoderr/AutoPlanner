import Folder from "../models/Folder";
import User from "../models/User";
import sequelize from "../sequelize";
import Todo from "../models/Todo";
import TodoModel from "../models/TodoModel";
import Node from "../models/Node";
import Step from "../models/Step";
import Response from "../models/Response";
import {Model} from "sequelize";
import {ModelStatic} from "sequelize/types/model";

let user: User;

beforeAll(async () => {
    user = await User.create({
        username: "testCascades",
        email: "testCascades@test.com",
        password: "1234"
    });
});

afterAll(async () => {
    await user.destroy();
    await sequelize.close();
})

function getOrCreate<M extends Model>(
    model: ModelStatic<M>,
    key: string,
    keyName: keyof M['_creationAttributes'],
    attr: M['_creationAttributes'],
    p: {
        onCreated?: ((m: M) => Promise<any>),
        onGot?: ((m: M) => Promise<any>)
    } = {}
): Promise<{m: M, created: boolean}> {
    return model.findOne({ //@ts-ignore
        where: {
            [keyName]: key
        }
    }).then(async m => {
        if (m) {
            if (p.onGot)
                await p.onGot(m);
            return {m, created: false};
        }

        m = await model.create(attr);
        if (p.onCreated)
            await p.onCreated(m);

        return {m, created: true};
    })

}

async function create2ndNodeTodoAndStep(parentNode: Node) {

    const {m: node2} = await getOrCreate(Node, 'node2', 'text', {
        text: "node2",
        type: "action",
        model_id: parentNode.model_id
    }, {onCreated: node2 => parentNode.addChild(node2)})

    const {m: todo2} = await getOrCreate(Todo, 'todo2', 'name', {
        name: "todo2",
        user_id: user.id,
        model_id: parentNode.model_id
    })

    const step = await Step.create({
        node_id: node2.id,
        todo_id: todo2.id
    });

    return {node2, todo2, step};
}

async function createNodeNode2AndResponse(model: TodoModel) {
    const {m: node, created: nodeCreated} = await getOrCreate(Node, 'node', 'text', {
        text: "node",
        type: "question",
        model_id: model.id
    });

    const {m: node2} = await getOrCreate(Node, 'node2', 'text', {
        text: "node2",
        type: "action",
        model_id: model.id
    }, {
        onCreated: node2 => node.addChild(node2),
        onGot: async node2 => nodeCreated && await node.addChild(node2)
    })

    const response = await Response.create({
        text: "response",
        question_id: node.id,
        action_id: node2.id
    })

    return {node, node2, response};
}


describe("Tests deletes on cascade",() => {
    let t;

    let folderA: Folder;
    let todoAA: Todo;

    let folderB: Folder;
    let folderBA: Folder;

    let model: TodoModel;
    let node: Node;
    let todo: Todo;

    let node2: Node;
    let todo2: Todo;
    let step: Step;

    let response: Response;

    beforeAll(async () => {
        t = await sequelize.transaction();
        sequelize.constructor['_cls'] = new Map();
        sequelize.constructor['_cls'].set('transaction', t);

        folderA = await Folder.create({
            name: "folder A",
            user_id: user.id
        });
        todoAA = await Todo.create({
            name: "todo AA",
            user_id: user.id,
            parent_id: folderA.id
        });

        folderB = await Folder.create({
            name: "folder B",
            user_id: user.id
        });
        folderBA = await Folder.create({
            name: "folder BA",
            user_id: user.id,
            parent_id: folderB.id
        });

        model = await TodoModel.create({
            name: "model",
            user_id: user.id
        });
        node = await Node.create({
            text: "node",
            type: "question",
            model_id: model.id
        })
        todo = await Todo.create({
            name: "todo",
            user_id: user.id,
            model_id: model.id
        });

        const secondNodeTodoAndStep = await create2ndNodeTodoAndStep(node);

        todo2 = secondNodeTodoAndStep.todo2;
        node2 = secondNodeTodoAndStep.node2;
        step = secondNodeTodoAndStep.step;
    })

    afterAll(() => t.rollback());

    test("Delete folderA with todo", async () => {
        await folderA.destroy();

        expect(
            await Todo.findOne({
                where: {
                    id: todoAA.id
                }
            })
        ).toEqual(null);
    })

    test("Delete folderB with folder", async () => {
        await folderB.destroy();

        expect(
            await Folder.findOne({
                where: {
                    id: folderBA.id
                }
            })
        ).toEqual(null);
    })

    test("Delete node2, with step", async () => {
        await node2.destroy();

        expect(
            await Step.findOne({
                where: {
                    id: step.id
                }
            })
        ).toEqual(null)
    })

    test("Delete todo2, with step", async () => {
        const secondNodeTodoAndStep = await create2ndNodeTodoAndStep(node);

        todo2 = secondNodeTodoAndStep.todo2;
        node2 = secondNodeTodoAndStep.node2;
        step = secondNodeTodoAndStep.step;

        await todo2.destroy();

        expect(
            await Step.findOne({
                where: {
                    id: step.id
                }
            })
        ).toEqual(null)
    })

    test("Delete node with response", async () => {
        const nodeNode2AndResponse = await createNodeNode2AndResponse(model);

        node = nodeNode2AndResponse.node;
        node2 = nodeNode2AndResponse.node2;
        response = nodeNode2AndResponse.response;

        await node.destroy();

        expect(
            await Response.findOne({
                where: {
                    id: response.id
                }
            })
        ).toEqual(null)
    })

    test("Delete node with response", async () => {
        const nodeNode2AndResponse = await createNodeNode2AndResponse(model);

        node = nodeNode2AndResponse.node;
        node2 = nodeNode2AndResponse.node2;
        response = nodeNode2AndResponse.response;

        await node2.destroy();

        expect(
            await Response.findOne({
                where: {
                    id: response.id
                }
            })
        ).toEqual(null)
    })

    test("Delete model, with node and todo", async () => {
        await model.destroy();

        expect(await Promise.all([
            Node.findOne({
                where: {
                    id: node.id
                }
            }),
            Todo.findOne({
                where: {
                    id: todo.id
                }
            })
        ])).toEqual([null,null]);
    })
})