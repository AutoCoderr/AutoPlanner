export default interface IField {
    required?: boolean;
    valid?: (value: any, body?: {[key: string]: any}) => boolean;
    format?: (value: any) => any;
    msg: string;
    inDB?: boolean
}