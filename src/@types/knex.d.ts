import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    meals: {
      id: string;
      name: string;
      desc: string;
      calories: number;
      isInTheDiet: boolean;
      created_at: string;
      session_id?: string;
      user_id: string;
    };
    users: {
      id: string;
      name: string;
      email: string;
      password: string;
      created_at: string;
      session_id?: string;
    };
  }
}
