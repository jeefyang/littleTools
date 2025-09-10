import { apiUrlsTrans } from "./tools/apiUrlsTrans";

const headerUrl = "";

export const CommonApiUrls = apiUrlsTrans(headerUrl, {
    routerList: { method: 'GET', type: {} as RouterListApi }
});


