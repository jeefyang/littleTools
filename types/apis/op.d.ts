type OPApiPageList = {
    from?: {};
    to: JRouterType;
};

type OPApiMapKeyValueType = {
    string: string,
    boolean: boolean,
    number: number,
    object: object,
    array: any[],
};

type OPApiGetMapKey = {
    from: {
        type: keyof OPApiMapKeyValueType;
        key: string;
    };
    to: {
        val: string;
    };
};

type OPApiSetMapKey = {
    from: {
        type: keyof OPApiMapKeyValueType;
        key: string;
        data?: any;
        /** 是否清空 */
        isClear?: boolean;
        /** 是否覆盖(与isAdd共用,类型为object才会生效) */
        isOverride?: boolean;
        /** 是否追加 */
        isAdd?: boolean;
    };
};