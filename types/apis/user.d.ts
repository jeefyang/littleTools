


interface UserApiLogin {
    from: {
        username: string,
        password: string;
    };
    to: {
        token: string;
        email: string;
        username: string;
    };
}

interface userApiGetPrivateResToken {
    to: {
        token: string;
    };
    from: {
        type: string;
    };
}