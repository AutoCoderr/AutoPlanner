import number from "./number";

export default value => number(value) && parseInt(value) === parseFloat(value);