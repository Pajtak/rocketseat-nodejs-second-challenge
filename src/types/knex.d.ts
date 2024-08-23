import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    user: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
      session_id?: string;
    };
  }
}
