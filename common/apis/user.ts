import { apiUrlsTrans } from "./tools/apiUrlsTrans";

const headerUrl = "user/";


export const UserApiUrls = apiUrlsTrans(headerUrl, {
    login: { method: 'POST', type: {} as UserApiLogin }
});


