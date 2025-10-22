import { CommonApiUrls } from "@common/apis/common";
import { OPApiUrls } from "@common/apis/op";
import { UserApiUrls } from "@common/apis/user";
import { UtilsApiUrls } from "@common/apis/utils";
import { apisTrans } from "./apisTrans";
import { NotesApiUrls } from "@common/apis/notes";

export const CommonApis = apisTrans(CommonApiUrls);

export const OPApis = apisTrans(OPApiUrls);

export const UtilsApis = apisTrans(UtilsApiUrls);

export const UserApis = apisTrans(UserApiUrls);

export const NotesApis = apisTrans(NotesApiUrls);

