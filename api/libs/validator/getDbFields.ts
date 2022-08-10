import IField from "../../interfaces/validator/IField";

export default function getDbFields(body: {[key: string]: any}, fields: {[key: string]: IField}) {
    return Object.entries(body).reduce((acc,[key,value]) => ({
        ...acc,
        ...((fields[key] && (fields[key].inDB??true)) ?
                {[key]: fields[key].format?.(value) ?? value} :
                {}
        )
    }), {})
}