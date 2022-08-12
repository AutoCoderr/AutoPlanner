import IReqData from "../../interfaces/form/IReqData";

export default function (req): IReqData {
    return ["user"].reduce((acc,key) => ({
        ...acc,
        [key]: req[key]
    }), {});
}
