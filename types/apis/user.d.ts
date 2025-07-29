


interface UserLoginApi {
    from: {
        userName: string,
        password: string;
    };
    to: {
        token?: string;
    };
}