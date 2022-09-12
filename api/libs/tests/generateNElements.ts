export default async function generateNElements<T>(callback: (i: number) => Promise<T>, n, elements: T[] = [], i = 0): Promise<T[]> {
    if (i === n)
        return elements;

    return generateNElements(
        callback,
        n,
        [...elements, await callback(i)],
        i+1
    )
}