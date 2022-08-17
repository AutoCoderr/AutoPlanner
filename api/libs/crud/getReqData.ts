import IReqData from "../../interfaces/IReqData";

export default function (req): IReqData {
    const keys: (keyof IReqData)[] = ["specifiedUser","todo","user","folder"];
    return keys.reduce((acc,key) => ({
        ...acc,
        [key]: req[key]
    }), {});
}
