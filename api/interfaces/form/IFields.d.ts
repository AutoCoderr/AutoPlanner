import IField from "./IField";

interface IFields<IData = any> {
    [key: Exclude<string,'fields'>]: IField<IData>;
}

export default IFields;