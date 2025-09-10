import { UtilsApiUrls } from "@apis/UtilsApis";
import { Main } from "../main";
import { Base } from "./class/base";
import { nanoid } from "nanoid";

export function UtilsApis(this: Main) {
    const base = new Base('utils', UtilsApiUrls);
    const decode_nanoid = base.decode.nanoid;
    this.appGet(decode_nanoid.url, async (req, res) => {
        const j = decode_nanoid.getResult({
            data: {
                id: nanoid(48)

            }
        });
        return res.status(200).json(j);
    });
}