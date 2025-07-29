import { useUserStore } from "@/stores/userStore";
import { useRoute } from "vue-router";

const route = useRoute();
const userStore = useUserStore();
export function jFetch(o: { method: "GET" | "POST", url: string, data: any; }): Promise<any> {
    const headers = new Headers({
        "Content-Type": "application/json",
        'token': userStore.token,
        'router': route.path,
    } as JHeaderType);
    return new Promise((res, rej) => {
        (() => {
            if (o.method == "GET") {
                const param = new URLSearchParams(o.data);
                return fetch(import.meta.env.VITE_API_BASE_URL + o.url + "?" + param, {
                    method: o.method,
                    headers
                });
            }
            else if (o.method == "POST") {
                return fetch(import.meta.env.VITE_API_BASE_URL + o.url, {
                    method: o.method,
                    headers,
                    body: JSON.stringify(o.data),
                });
            }
            return fetch(o.url);
        })().then(r => r.json()).catch(e => {
            rej(e);
        }).then(r => res(r)).catch(e => {
            rej(e);
        });
    });



}