import { apiUrlsTrans } from "./tools/apiUrlsTrans";

const headerUrl = "utils/";


export const UtilsApiUrls = apiUrlsTrans(headerUrl, {
    nanoid: { method: 'GET', type: {} as UtilsApiNanoid }
});

