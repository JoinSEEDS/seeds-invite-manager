import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("test_setup", (table: Knex.TableBuilder) => {
        table.uuid("id").primary();
        table.string("string_key_one").index("test_setup_id2");
        table.timestamp("created_at");
        table.timestamp("last_updated_at");
      });

    await knex.schema.createTable("AuthTokens", (table: Knex.TableBuilder) => {
        table.increments("Id").primary();
        table.string("AuthId");
        table.text("Policy");
        table.string("Signature");
        table.string("Token");
        table.bigInteger("ValidUntil");
        table.timestamp("DateValidUntil");
        table.boolean("IsSigned");
        table.json("Json");
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('test_setup');
    await knex.schema.dropTable('AuthTokens');
}

