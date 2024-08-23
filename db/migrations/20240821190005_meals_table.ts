import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary().notNullable;
    table.text("name").notNullable;
    table.text("desc").notNullable;
    table.double("calories").notNullable;
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.boolean("isInTheDiet").notNullable().defaultTo(false);
    table.text("user_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("meals");
}
