import { jFetch } from "@/utils/jFetch";

const headerUrl = "op/";


export default {
    pageList: ((data) => jFetch({ method: 'POST', data, url: headerUrl + "pageList" })) as JFetchApiType<OPApiPageList>
};