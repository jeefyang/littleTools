import { useUserStore } from "@/stores/userStore";
import { commonUtils } from "@common/utils/common";

let userStore: ReturnType<typeof useUserStore> | undefined = undefined;
export function jFetch(o: { method: "GET" | "POST", url: string, data?: any; }, other: JFetchOtherType): Promise<any> {
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
                !other.ignoreLogin && (userStore!.isShowLogin = true);
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

export function jFetchFormdata(o: { url: string, formdata: FormData; }, other?: JFetchOtherType) {
    if (!other) {
        other = {};
    }
    const headers = new Headers({
        'token': userStore!.userInfo?.token || "",
    } as JHeaderType);
    return new Promise(async (res, rej) => {
        return fetch(import.meta.env.VITE_API_BASE_URL + o.url, {
            method: "POST",
            headers,
            body: o.formdata,
        }).then(r => {
            if (r.status == 401) {
                !other.ignoreLogin && (userStore!.isShowLogin = true);
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

export function jFetchUpload(o: UploadFileDataType & {
    formdata: FormData;
}) {
    return jFetchFormdata({
        url: `${commonUtils.uploadBaseUrl}?privateType=${o.privateType || ""}&type=${o.type || ""}&dir=${encodeURIComponent(o.dir || "")}`,
        formdata: o.formdata,
    }) as Promise<UploadFileReturnType>;
};

export type JFetchFileType = {
    token?: string;
    url: string;
    isPrivate?: boolean;
};

export function jFetchFileUrl(o: JFetchFileType) {
    let url = "";
    if (o.isPrivate) {
        url = import.meta.env.VITE_API_BASE_URL + commonUtils.privateResBaseUrl + `/${o.token || ""}/${o.url}`;
    }
    else {
        url = import.meta.env.VITE_API_BASE_URL + commonUtils.resBaseUrl + `/${o.url}`;
    }
    return url;
}
export function jFetchFile(o: JFetchFileType) {
    const headers = new Headers({
        'token': userStore!.userInfo?.token || "",
    } as JHeaderType);
    let url = jFetchFileUrl(o);
    return fetch(url, { method: "GET", headers });

}