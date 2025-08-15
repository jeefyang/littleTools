import { jFetch } from "@/utils/jFetch";

const headerUrl = "user/";

export default {
    login: ((data) => jFetch({ method: 'POST', data, url: headerUrl + "login" })) as JFetchApiType<UserApiLogin>
};