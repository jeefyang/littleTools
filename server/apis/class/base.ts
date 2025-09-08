export class Base {
    constructor(public apiName: string) {

    }

    getUrl(url: string) {
        return process.env.VITE_API_BASE_URL + this.apiName + url;
    }
}