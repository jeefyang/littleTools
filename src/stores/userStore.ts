import { loadKeyStorage } from "@/utils/storage";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {

    const isShowLogin = ref(false);
    const token = ref("");
    const isExpired = ref(false);
    const userInfo = ref<Partial<UserLoginApi['to']> & {}>({});

    /** 登出 */
    const logout = () => {
        userInfo.value = {};
    };

    /** 更新用户信息 */
    const updateUserInfo = () => {
        Object.assign(userInfo.value, loadKeyStorage("user"));
    };

    return {
        isShowLogin,
        token,
        isExpired,
        userInfo,
        logout,
        updateUserInfo
    };

});