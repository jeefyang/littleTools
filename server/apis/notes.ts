import { Main } from "../main";
import { Base } from "./class/base";
import { NotesApiUrls } from "@common/apis/NotesApis";


export function NotesApis(this: Main) {
    const base = new Base("op", NotesApiUrls);

    // const decode_pageList = base.decode.pageList;
    // this.appPost(decode_pageList.url, async (req, res) => {
    //     const j = decode_pageList.getResult({});
    //     return res.status(200).json(j);
    // });
}