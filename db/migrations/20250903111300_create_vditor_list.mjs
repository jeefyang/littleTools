
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.createTable('vditor_list', (table) => {
        table.increments('id').primary();
        table.text("uuid").notNullable().unique();
        table.integer("createDate").notNullable();
        table.integer("fixDate").notNullable();
        table.text("tags")
        table.text("name").notNullable()
        table.text("desc")
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('vditor_list');

};
