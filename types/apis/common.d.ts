type ApiReturnType<T extends { from?: any, to?: any; }, D extends { [x in string]: {
    url: string;
    method: HttpMethod;
    type: T;
} }> = { [x in keyof D]: JFetchApiType<D[x]["type"]> };
