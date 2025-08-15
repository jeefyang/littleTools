type JRouterType = {
    /** 绝对路径 */
    absUrl: string;
    /** 显示名称 */
    title: string;
    /** 路由 */
    router: string;
    /** 是否多开 */
    isMulti: string;
    /** 是否重载 */
    isRenew: string;
    /** 是否在菜单显示 */
    isMenu: string;
    /** 是否需要登录 */
    isLogin: string;
};

type IsOptional<T, K extends keyof T> = undefined extends T[K] ? true : false;