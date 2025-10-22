
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.createTable('opkeyMap', (table) => {
        table.increments('id').primary();
        table.text("key").notNullable();
        table.text("type").notNullable();
        table.text("tsType")
        table.text("value")
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('opkeyMap');

};
