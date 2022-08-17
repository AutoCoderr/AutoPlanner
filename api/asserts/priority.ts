import number from "./number";

export default value => {
    if (!number(value))
        return false;

    const convertedValue = parseInt(value);
    if (convertedValue !== parseFloat(value))
        return false;

    return convertedValue > 0 && convertedValue <= 5
}