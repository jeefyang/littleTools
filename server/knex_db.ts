import Knex from "knex";
import { type User } from "./dbTypes/user";
//@ts-ignore
import config from "knexfile.mjs";
import { cryptoUtil } from "./utils/cryptoUtil";

declare type config = { [x in string]: Knex.Knex.Config };

export type DBTableType = {
    "users": User;
};


export class KnexDB {
    knex: Knex.Knex | undefined = undefined;
    config: Knex.Knex.Config | undefined = undefined;


    async init() {
        console.log("config", config);
        this.config = config[process.env.NODE_ENV];
        this.knex = Knex(config[process.env.NODE_ENV]);
        await this.knex.migrate.latest();
        const a = await this.table("users");
        if (a.length == 0) {

            await this.table("users").insert([{
                username: process.env.VITE_INIT_LOGIN_USERNAME,
                password: cryptoUtil.hasedPassword(process.env.VITE_INIT_LOGIN_PASSWORD),
                email: ""
            }]);
        }
    }

    table<K extends keyof DBTableType>(table: K): Knex.Knex.QueryBuilder<DBTableType[K], DBTableType[K][]>;
    table(table: string): Knex.Knex.QueryBuilder<any>;
    table(table: string) {
        return this.knex!.table(table);
    }

    selectFrom<K extends keyof DBTableType, Arg extends keyof (DBTableType[K])>(args: Arg[], table: K): Knex.Knex.QueryBuilder<Pick<DBTableType[K], Arg>, Pick<DBTableType[K], Arg>[]>;
    selectFrom(args: string[], table: string): Knex.Knex.QueryBuilder<any>;
    selectFrom(args: string[], table: string) {
        return this.knex!.select(args).from(table);
    }

    where<K extends keyof DBTableType>(table: K, args: Partial<DBTableType[K]>) {
        return this.knex!.table(table).where(args);
    }

}