
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.createTable('markdowns', (table) => {
        table.increments('id').primary();
        table.text("uuid").notNullable().unique();
        table.integer("createDate").notNullable();
        table.integer("fixDate").notNullable();
        table.text("name").notNullable()
        table.text("tags")
        table.text("desc")
        table.text("type")
        table.text("other")
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    return knex.schema.dropTable('markdowns');

};
