


interface UserLoginApi {
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