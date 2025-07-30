import { table } from 'console';
import Knex from 'knex';
import path from 'path';

export class DB {
    knex: Knex.Knex | undefined = undefined;
    dbDir: string = 'db';

    constructor() {
        this.knex = Knex({
            client: "sqlite3",
            connection: {
                filename: path.join(process.env.VITE_PRIVATE_RES_DIR, this.dbDir, process.env.VITE_SQLITE_DB_NAME),
                password: process.env.VITE_SQLITE_DB_PASSWORD,
                user: process.env.VITE_SQLITE_DB_USERNAME,
            },
            useNullAsDefault: true,
            migrations: {
                directory: path.join(process.env.VITE_PRIVATE_RES_DIR, this.dbDir, "migrations"),
            }
        });
    }

    async initializeDB() {
        if (!this.knex) {
            return;
        }
        const log = "Database already initialized";
        const hasUsersTable = await this.knex.schema.hasTable("users");
        if (hasUsersTable) {
            console.log(log);
            return;
        }
        await this.knex.migrate.latest();
        console.log('Database user tables created');
        console.log(log);
    }


    createUsersTable() {
        if (!this.knex) {
            return;
        }
        this.knex.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string("username").notNullable().unique();
            table.string("password").notNullable();
            table.timestamps(true, true);

        });
    }
}