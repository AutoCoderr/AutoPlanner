import IReqData from "../../interfaces/IReqData";

export default function (req): IReqData {
    const keys: (keyof IReqData)[] = ["specifiedUser","todo","user","folder","model","node","step","all"];
    return keys.reduce((acc,key) => ({
        ...acc,
        [key]: req[key]
    }), {query: req.query});
}
