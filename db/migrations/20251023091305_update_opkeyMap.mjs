
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    return knex.schema.alterTable('opkeyMap', (table) => {
        table.text("desc")
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    knex.schema.alterTable('opkeyMap', (table) => {
        table.dropColumn('desc');
    });
};
