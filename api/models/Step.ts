import {
    Model,
    DataTypes,
    InferAttributes,
    BelongsToSetAssociationMixin,
    BelongsToManySetAssociationsMixin, BelongsToManyAddAssociationMixin
} from "sequelize";
import sequelize from "../sequelize";
import Todo from "./Todo";
import Node from "./Node";
import Folder from "./Folder";
import RelationStepTodo from "./RelationStepTodo";
import RelationStepFolder from "./RelationStepFolder";
import {IStep, IStepCreation} from "../interfaces/models/Step";

class Step extends Model <InferAttributes<Step>, IStepCreation> implements IStep {
    declare id: number;
    declare percent: number;
    declare percentSynchronized: boolean;
    declare deadLine: Date;
    declare todo_id: number;
    declare node_id: number;

    declare createdAt: Date;
    declare updatedAt: Date;

    declare setNode: BelongsToSetAssociationMixin<Node, any>;
    declare setTodo: BelongsToSetAssociationMixin<Todo, any>;
    declare setAssociatedTodos: BelongsToManySetAssociationsMixin<Todo, any>;
    declare addAssociatedTodo: BelongsToManyAddAssociationMixin<Todo, any>;
    declare setAssociatedFolders: BelongsToManySetAssociationsMixin<Folder, any>;
    declare addAssociatedFolder: BelongsToManyAddAssociationMixin<Folder, any>;
}

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
        node_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        todo_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        deadLine: {
            type: DataTypes.DATE,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
    },
    { //@ts-ignore
        sequelize,
        modelName: "Step",
    }
);

Step.belongsTo(Node, { foreignKey: "node_id", as: "node", onDelete: 'CASCADE' });
Step.belongsTo(Todo, { foreignKey: "todo_id", as: "todo", onDelete: 'CASCADE' });
Todo.hasMany(Step, { foreignKey: "todo_id", as: "steps" });
Node.hasMany(Step, { foreignKey: "node_id", as: "steps" });

Step.belongsToMany(Todo, { through: RelationStepTodo, foreignKey: "step_id", as: "associatedTodos"})
Todo.belongsToMany(Step, { through: RelationStepTodo, foreignKey: "todo_id", as: "associatedSteps" })

Step.belongsToMany(Folder, { through: RelationStepFolder, foreignKey: "step_id", as: "associatedFolders" })
Folder.belongsToMany(Step, { through: RelationStepFolder, foreignKey: "folder_id", as: "associatedSteps" })

export default Step;
