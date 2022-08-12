interface ICrudParams {
    errorCode?: number | ((e) => number),
    finished?: (createdElement) => Promise<any>|any
}

export default IPostParams;