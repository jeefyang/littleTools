
type VditorContentType = {
    uuid: string;
    content?: string;
    tags?: string;
    desc?: string;
    name?: string;
    createDate?: number;
    fixDate?: number;
};

interface NotesApiVditorCreate {
    from: VditorContentType;
}

interface NotesApiVditorEdit {
    from: VditorContentType;
}


interface NotesApiVditorUpload {
    query: {
        uuid: string;
    };
}
