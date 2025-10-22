


type UserApiLogin = {
    from: {
        username: string,
        password: string;
    };
    to: {
        token: string;
        email: string;
        username: string;
    };
};

type userApiGetPrivateResToken = {
    to: {
        token: string;
    };
    from: {
        type: string;
    };
};