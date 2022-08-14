interface ICrudParams {
    errorCode?: number | ((e) => number),
    finished?: (element: any = undefined) => Promise<any>|any
}

export default ICrudParams;