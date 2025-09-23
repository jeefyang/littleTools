import { UtilsApiUrls } from "@common/apis/utils";
import { Main } from "../main";
import { Base } from "./class/base";
import { nanoid } from "nanoid";

export function UtilsApis(this: Main) {
    const base = new Base('utils', UtilsApiUrls);

    const decode_nanoid = base.decode.nanoid;
    this.appGet(decode_nanoid.url, async (req, res) => {
        const query = decode_nanoid.getQuery(req);
        const j = decode_nanoid.getResult({
            data: {
                id: nanoid(parseInt(query?.len?.toString() || '24'))

            }
        });
        return res.status(200).json(j);
    });
}