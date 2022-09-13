interface IAdditionalFields<IData = any> {
    [key: string]: (data: IData) => Promise<any>|any
}

export default IAdditionalFields;