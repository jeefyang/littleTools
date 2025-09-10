import { apiUrlsTrans } from "./tools/apiUrlsTrans";


const headerUrl = "op/";


export const OPApiUrls = apiUrlsTrans(headerUrl, {
    pageList: { method: 'POST', type: {} as OPApiPageList }
});
