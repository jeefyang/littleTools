import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {

    const isShowLogin = ref(false);
    const token = ref("");
    const isExpired = ref(false);
    const userInfo = ref<any>(null);

    const logout = () => {

    };

    return {
        isShowLogin,
        token,
        isExpired,
        userInfo,
        logout
    };

});