import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("survey_submissions", (table) => {
        table.increments("id").primary().notNullable();
        table.dateTime("time").defaultTo(knex.fn.now()).notNullable();
        table.integer("coreprotect_uid").references("rowid").inTable("co_user").notNullable();
        table.string("survey_id", 100).notNullable();
        table.text("responses").notNullable();
        table.unique(["coreprotect_uid", "survey_id"]);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("survey_submissions");
}
