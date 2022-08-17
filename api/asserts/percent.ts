import isNumber from "../libs/isNumber";

export default value => {
    if (!isNumber(value))
        return false;

    const convertedValue = parseFloat(value);
    return convertedValue >= 0 && convertedValue <= 100
}