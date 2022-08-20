import IQuerySortParams from "../interfaces/IQuerySortParams";
import {Order} from "sequelize";

export default function getQuerySort(query: {[key: string]: string}, querySortParams: IQuerySortParams): Order {
    const asc: [string, 'ASC'][] = query.asc ? query.asc.split(",")
        .map(s => s.trim())
        .filter(s => (querySortParams.asc??[]).includes(s))
        .map(s => [s, 'ASC']) : [];
    const desc: [string, 'DESC'][] = query.desc ? query.desc.split(",")
        .map(s => s.trim())
        .filter(s => (querySortParams.asc??[]).includes(s))
        .map(s => [s, 'DESC']) : [];

    const conflictedSortingKeys: string[] = asc.reduce((acc: string[],[k1]) => [
        ...acc,
        ...(desc.some(([k2]) => k1 === k2) ? [k1] : [])
    ], [])

    return [
        ...asc.filter(([k]) => !conflictedSortingKeys.includes(k)),
        ...desc.filter(([k]) => !conflictedSortingKeys.includes(k))
    ]
}