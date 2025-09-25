import { useUserStore } from "@/stores/userStore";


let userStore: ReturnType<typeof useUserStore> | undefined = undefined;
export function jFetch(o: { method: "GET" | "POST", url: string, data?: any; }): Promise<any> {
    if (!userStore) {
        userStore = useUserStore();
    }
    const headers = new Headers({
        "Content-Type": "application/json",
        'token': userStore!.userInfo?.token || "",
        'router': location.pathname
    } as JHeaderType);
    return new Promise((res, rej) => {
        (() => {
            if (o.method == "GET") {
                const param = new URLSearchParams(o.data || {});
                return fetch(import.meta.env.VITE_API_BASE_URL + o.url + "?" + param, {
                    method: o.method,
                    headers
                });
            }
            else if (o.method == "POST") {
                return fetch(import.meta.env.VITE_API_BASE_URL + o.url, {
                    method: o.method,
                    headers,
                    body: JSON.stringify(o.data || {}),
                });
            }
            return fetch(o.url);
        })().then(r => {
            if (r.status == 401) {
                userStore!.isShowLogin = true;
            }
            return r.json();
        }
        ).catch(e => {
            rej(e);
        }).then(r => res(r)).catch(e => {
            rej(e);
        });
    });
}

export function jFetchFormdata(o: { url: string, formdata: FormData; }) {
    const headers = new Headers({
        'token': userStore!.userInfo?.token || "",
    } as JHeaderType);
    return new Promise((res, rej) => {
        return fetch(import.meta.env.VITE_API_BASE_URL + o.url, {
            method: "POST",
            headers,
            body: o.formdata,
        }).then(r => {
            if (r.status == 401) {
                userStore!.isShowLogin = true;
            }
            return r.json();
        }
        ).catch(e => {
            rej(e);
        }).then(r => res(r)).catch(e => {
            rej(e);
        });
    });
}