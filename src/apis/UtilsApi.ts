import { jFetch } from "@/utils/jFetch";

const headerUrl = "utils/";


export default {
    nanoid: ((data?) => jFetch({ method: 'GET', data, url: headerUrl + "nanoid" })) as JFetchApiType<UtilsApiNanoid>
};