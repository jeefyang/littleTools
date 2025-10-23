import { apiUrlsTrans } from "./tools/apiUrlsTrans";


const headerUrl = "note/";

export const NotesApiUrls = apiUrlsTrans(headerUrl, {
    markdownCreate: { method: "POST", type: {} as NotesApiMarkdownCreate },
    markdownEdit: { method: 'POST', type: {} as NotesApiMarkdownEdit },
    markdownList: { method: 'POST', type: {} as NotesApiMarkdownList },
    markdownDelete: { method: 'POST', type: {} as NotesApiMarkdownDelete },
    markdownTagList: { method: 'GET', type: {} as NotesApiMarkdownTagList },
    markdownIsNew: { method: 'POST', type: {} as NoteApiMarkdownIsNew },
});
