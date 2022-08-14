import Folder from "../../models/Folder";
import Node from "../../models/Node";
import Response from "../../models/Response";
import Step from "../../models/Step";
import Todo from "../../models/Todo";
import TodoModel from "../../models/TodoModel";
import User from "../../models/User";

interface IField {
    required?: boolean;
    valid?: (value: any, data: {[key: string]: any}) => Promise<boolean>|boolean;
    format?: (value: any) => Promise<any>|any;
    msg: string;
    inDB?: boolean;
    model?: typeof Folder|typeof Node|typeof Response|typeof Step|typeof Todo|typeof TodoModel|typeof User
}

export default IField;