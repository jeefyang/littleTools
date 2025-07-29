import { jFetch } from "@/utils/jFetch";

export default {
    login: ((data) => jFetch({ method: 'POST', data, url: "user/login" })) as JFetchApiType<UserLoginApi>
};