import { jFetch } from "@/utils/jFetch";

export default {
    routerList: ((data) => jFetch({ method: 'GET', data, url: "routerList" })) as JFetchApiType<RouterListApi>
};