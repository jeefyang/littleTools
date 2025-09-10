import { jFetch } from "@/utils/jFetch";


export function apisTrans<T extends { from?: any, to?: any; }, D extends { [x in string]: {
    url: string;
    method: HttpMethod;
    type: T;
} }>(o: D): ApiReturnType<T, D> {
    const newData: ApiReturnType<T, D> = {} as ApiReturnType<T, D>;
    for (const key in o) {
        const c = o[key as keyof D];
        newData[key as keyof D] = ((data?: any) => jFetch({
            method: c.method,
            url: c.url,
            data: data
        })) as JFetchApiType<typeof c.type>;
    }
    return newData;
};