export default function compileDataValues(obj) {
    if (typeof(obj) !== "object" || obj === null || obj instanceof Date)
        return obj;

    if (obj instanceof Array)
        return obj.map(elem => compileDataValues(elem));

    if (obj.dataValues)
        return compileDataValues(obj.dataValues);

    return Object.entries(obj).reduce((acc,[key,value]) => ({
        ...acc,
        [key]: compileDataValues(value)
    }), {})
}