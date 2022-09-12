import {Model} from "sequelize";

interface IPaginatedResult<M extends Model> {
    pages: number;
    elements: M[]
}

export default IPaginatedResult