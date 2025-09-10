import { CommonApiUrls } from "../CommonApis";
import { OPApiUrls } from "../OPApis";
import { UserApiUrls } from "../UserApis";
import { UtilsApiUrls } from "../UtilsApis";
import { apisTrans } from "./apisTrans";

export const CommonApis = apisTrans(CommonApiUrls);

export const OPApis = apisTrans(OPApiUrls);

export const UtilsApis = apisTrans(UtilsApiUrls);

export const UserApis = apisTrans(UserApiUrls);

