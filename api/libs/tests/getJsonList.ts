import {Model} from "sequelize";

const getJsonList = <M extends Model>(callback: (elem: M) => any) => (...elements: (M|M[])[]) => {
    const elementsArray: M[] = elements.reduce((acc: M[],elementOrArray) => [
        ...acc,
        ...(
            elementOrArray instanceof Array ? elementOrArray : [elementOrArray]
        )
    ], [])
    return elementsArray.map(callback)
}

export default getJsonList;