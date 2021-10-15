import { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config({ path: '.env' });

if(process.env.DATABASE_URL == null){
  dotenv.config({ path: '../../.env' });
}

//console.log(process.env.DATABASE_URL);

const config: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    timezone: "utc",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "migrations",
  },
};

export default config;