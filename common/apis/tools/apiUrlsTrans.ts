export function apiUrlsTrans<T extends { from?: any, to?: any; }, D extends { [x in string]: {
    url?: string;
    method: HttpMethod;
    type: T;
} }>(headerUrl: string, o: D) {
    const newO = {} as { [x in keyof D]: { url: string; } & D[x] };
    for (const key in o) {
        const c = o[key as keyof D];
        newO[key as keyof D] = { url: headerUrl + key, ...c };

    }
    return newO;
}