

type BaseKeysType = {
    user: UserLoginApi['to'];
};

type OtherKeysType = Omit<{ [x: string]: any; }, keyof BaseKeysType>;

type KeysType = BaseKeysType & OtherKeysType;

export function loadKeyStorage<K extends keyof BaseKeysType>(key: K): BaseKeysType[K];

export function loadKeyStorage<K extends OtherKeysType>(key: K): any | undefined;

export function loadKeyStorage<K extends keyof KeysType>(key: K): KeysType[K] | undefined {
    const user = localStorage.getItem(String(key));
    if (user) {
        return JSON.parse(user);
    }
    return undefined;
}


export function saveKeyStorage<K extends keyof BaseKeysType>(key: K, data?: BaseKeysType[K]): void;

export function saveKeyStorage<K extends OtherKeysType>(key: K, data?: any): void;

export function saveKeyStorage<K extends keyof KeysType>(key: K, data?: KeysType[K]) {
    localStorage.setItem(String(key), data == undefined ? "" : JSON.stringify(data));
}