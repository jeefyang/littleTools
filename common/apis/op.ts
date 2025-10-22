import { apiUrlsTrans } from "./tools/apiUrlsTrans";


const headerUrl = "op/";


export const OPApiUrls = apiUrlsTrans(headerUrl, {
    pageList: { method: 'POST', type: {} as OPApiPageList },
    getMapKey: { method: 'GET', type: {} as OPApiGetMapKey },
    setMapKey: { method: "POST", type: {} as OPApiSetMapKey }
});

export const opMapKeyDefaultStr: { [x in keyof OPApiMapKeyValueType]: string } = {
    string: "",
    array: "[]",
    object: "{}",
    number: "0",
    boolean: "false",
};

export type whiteList_opMapKey_keyname = "markdown_tagList";

export const whiteList_opMapKey: {
    key: whiteList_opMapKey_keyname,
    type?: keyof OPApiMapKeyValueType,
    tsType?: string,
}[] = [
        {
            key: "markdown_tagList",
            type: "array",
            tsType: "string[]"
        }
    ];