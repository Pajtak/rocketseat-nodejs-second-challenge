import { knex as setupKnex } from "knex";
import { resolve } from "path";

export const config = {
  client: "sqlite",
  connection: {
    filename: resolve("./db/app.db"),
  },
  useNullAsDefault: true,
};

export const knex = setupKnex(config);
