interface IAdditionalFields {
    [key: string]: (data: {[key: string]: any}) => Promise<any>|any
}

export default IAdditionalFields;