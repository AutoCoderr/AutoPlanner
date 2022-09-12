import {Attributes, FindOptions, ModelStatic} from "sequelize/types/model";
import {Model} from "sequelize";
import isNumber from "./isNumber";
import IPaginatedResult from "../interfaces/crud/IPaginatedResult";

export default async function paginate<M extends Model>(
    model: ModelStatic<M>,
    findOptions: FindOptions<Attributes<M>>,
    query: {[key: string]: string},
    nbByPage
): Promise<IPaginatedResult<M>> {
    const page = (isNumber(query.page) && parseInt(query.page) >= 1) ? parseInt(query.page) : 1

    const elements = await model.findAll({
        ...findOptions,
        limit: nbByPage,
        offset: (page-1)*nbByPage
    })
    const pages = await model.count(findOptions).then(n => Math.floor(n/nbByPage) + (n%nbByPage === 0 ? 0 : 1))

    return {elements, pages}
}