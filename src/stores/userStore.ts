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
    const loginEventList: { fn: () => void, id: string; }[] = [];

    /** 检测是否已经登录 */
    const checkIsLogin = () => {
        return !!userInfo.value.token;
    };

    /** 添加监听登录事件 */
    const addListenLoginEvent = (fn: () => void, id?: string) => {
        if (id) {
            const index = loginEventList.findIndex(item => item.id === id);
            if (index !== -1) {
                loginEventList.splice(index, 1);
            }
        }
        else {
            id = new Date().getTime().toString() + "_" + Math.random().toString(36).substring(2);
        }
        loginEventList.push({ fn, id });
        return id;
    };

    /** 移除监听登录事件 */
    const removeLoginEvent = (id: string) => {
        const index = loginEventList.findIndex(item => item.id === id);
        if (index !== -1) {
            loginEventList.splice(index, 1);
        }
    };

    /** 触发登录事件 */
    const dispatchLoginEvent = () => {
        loginEventList.forEach(item => item.fn());
    };

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
        isUpdateLoginCount,
        dispatchLoginEvent,
        addListenLoginEvent,
        removeLoginEvent,
        checkIsLogin
    };

});