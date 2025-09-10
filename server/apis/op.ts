import { Main } from "../main";
import { Base } from "./class/base";
import { OPApiUrls } from "@common/apis/op";

export function OPApis(this: Main) {
    const base = new Base("op", OPApiUrls);

    const decode_pageList = base.decode.pageList;
    this.appPost(decode_pageList.url, async (req, res) => {
        const j = decode_pageList.getResult({});
        return res.status(200).json(j);
    });
}