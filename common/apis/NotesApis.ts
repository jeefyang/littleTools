import { apiUrlsTrans } from "./tools/apiUrlsTrans";


const headerUrl = "note/";

export const NotesApiUrls = apiUrlsTrans(headerUrl, {
    vditorCreate: { method: "POST", type: {} as NotesApiVditorCreate },
    vditorEdit: { method: 'POST', type: {} as NotesApiVditorEdit }
});
