import { Model, DataTypes } from "sequelize";
import sequelize from "../sequelize";
import Todo from "./Todo";
import Node from "./Node";
import Folder from "./Folder";
import RelationStepTodo from "./RelationStepTodo";
import RelationStepFolder from "./RelationStepFolder";

class Step extends Model {}

Step.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        percent: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        percentSynchronized: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        nb: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
    },
    { //@ts-ignore
        sequelize,
        modelName: "Step",
    }
);

Step.belongsTo(Node, { foreignKey: "node_id", as: "node" });
Step.belongsTo(Todo, { foreignKey: "todo_id", as: "todo" });
Todo.hasMany(Step, { foreignKey: "todo_id", as: "steps" });

Step.belongsToMany(Todo, { through: RelationStepTodo, foreignKey: "todo_id", as: "todos"})
Todo.belongsToMany(Step, { through: RelationStepTodo, foreignKey: "step_id", as: "associated_steps" })

Step.belongsToMany(Folder, { through: RelationStepFolder, foreignKey: "folder_id", as: "folders" })
Folder.belongsToMany(Step, { through: RelationStepFolder, foreignKey: "step_id", as: "associated_steps" })

export default Step;
