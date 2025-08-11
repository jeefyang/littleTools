// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
    development: {
        client: 'better-sqlite3',
        connection: {
            filename: './db/dev.sqlite3'
        },
        useNullAsDefault: true,
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
            extension: 'mjs',
            loadExtensions: ['.mjs'],
        },
        seeds: {
            directory: './seeders',
            extension: "mjs",
            loadExtensions: ['.mjs'],
        },
    },

    production: {
        client: 'sqlite3',
        connection: {
            filename: './db/prod.sqlite3'
        },
        useNullAsDefault: true,
        migrations: {
            directory: './db/migrations',
            tableName: 'knex_migrations',
            extension: 'mjs',
            loadExtensions: ['.mjs'],
        },
        seeds: {
            directory: './db/seeders',
            extension: "mjs",
            loadExtensions: ['.mjs'],
        }
    }
};

export default config;