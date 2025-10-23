
type MarkdownContentType = {
    uuid: string;
    content?: string;
    tags?: string[];
    desc?: string;
    name?: string;
    createDate?: number;
    fixDate?: number;
};

type NotesApiMarkdownCreate = {
    from: MarkdownContentType;
};

type NotesApiMarkdownEdit = {
    from: MarkdownContentType;
};

type NotesApiMarkdownList = {
    from: {
        tags?: string[],
        name?: string,
        fixStart?: number;
        fixEnd?: number,
        createStart?: number;
        createEnd?: number;
    };
    to: {
        list: {
            uuid: string;
            desc: string;
            name: string;
            tags: string[];
            createDate: number;
            fixDate: number;
        }[];
    };
};

type NotesApiMarkdownTagList = {

    to: {
        list: string[];
    };
};

type NotesApiMarkdownDelete = {
    from: {
        uuid: string;
    };
};


type NotesApiMarkdownUpload = {
    query: {
        uuid: string;
    };
};

type NoteApiMarkdownIsNew = {
    from: {
        uuid: string;
    };
    to: {
        isNew: boolean;
    };
};
