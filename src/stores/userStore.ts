import { loadKeyStorage, saveKeyStorage } from "@/utils/storage";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {

    /** 是否显示登录框 */
    const isShowLogin = ref(false);
    /** 用户信息 */
    const userInfo = ref<Partial<UserApiLogin['to']> & {}>({});
    /** 登录更新计时器 */
    const isUpdateLoginCount = ref(0);

    /** 登出 */
    const logout = () => {
        saveKeyStorage("user", undefined);
        userInfo.value = {};
    };

    /** 更新用户信息 */
    const updateUserInfo = () => {
        Object.assign(userInfo.value, loadKeyStorage("user"));
    };

    return {
        isShowLogin,
        userInfo,
        logout,
        updateUserInfo,
        isUpdateLoginCount
    };

});