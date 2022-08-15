import IField from "./IField";

interface IFields {
    [key: Exclude<string,'fields'>]: IField;
}

export default IFields;