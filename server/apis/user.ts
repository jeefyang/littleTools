import { Express } from "express";

export function userApis(app: Express) {
    const apiName = 'user';
    const getUrl = (url: string) => {
        return process.env.VITE_API_BASE_URL + apiName + url;
    };
    app.post(getUrl('/login'), (req, res) => {

    });
}