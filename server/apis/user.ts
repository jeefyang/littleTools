import { Main } from "../main";

export function userApis(this: Main) {
    const apiName = 'user';
    const getUrl = (url: string) => {
        return process.env.VITE_API_BASE_URL + apiName + url;
    };
    this.app.post(getUrl('/login'), (req, res) => {

    });
}