import { CommonApiUrls } from "@common/apis/CommonApis";
import { OPApiUrls } from "@common/apis/OPApis";
import { UserApiUrls } from "@common/apis/UserApis";
import { UtilsApiUrls } from "@common/apis/UtilsApis";
import { apisTrans } from "./apisTrans";

export const CommonApis = apisTrans(CommonApiUrls);

export const OPApis = apisTrans(OPApiUrls);

export const UtilsApis = apisTrans(UtilsApiUrls);

export const UserApis = apisTrans(UserApiUrls);

