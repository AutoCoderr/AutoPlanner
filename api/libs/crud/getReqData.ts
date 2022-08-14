import IReqData from "../../interfaces/form/IReqData";

export default function (req): IReqData {
    const keys: (keyof IReqData)[] = ["specifiedUser","todo","user"];
    return keys.reduce((acc,key) => ({
        ...acc,
        [key]: req[key]
    }), {});
}
