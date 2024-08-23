import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database/database";
import { randomUUID } from "crypto";
import { checkSessionIdExists } from "@/middleware/checkSessionIdExists";
import { ensureSessionId } from "@/middleware/ensureSessionId";

export const userRoutes = async (app: FastifyInstance) => {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { sessionId } = req.cookies;
      const users = await knex("users").where("session_id", sessionId).select();
      return {
        users,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = req.cookies;

      const { id } = getTransactionParamsSchema.parse(req.params);

      const user = await knex("users")
        .where({ session_id: sessionId, id })
        .first();

      return {
        user,
      };
    }
  );

  app.post(
    "/",
    {
      preHandler: [ensureSessionId],
    },
    async (req, res) => {
      const createUserSchema = z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      });

      const { name, email, password } = createUserSchema.parse(req.body);

      let sessionId = req.cookies.sessionId;

      if (!sessionId) {
        sessionId = randomUUID();

        res.cookie("sessionId", sessionId, {
          path: "/",
          maxAge: 60 * 60 * 7, // 7 days
        });
      }
      try {
        await knex("users").insert({
          id: randomUUID(),
          name,
          email,
          password,
          session_id: sessionId,
        });

        return res.status(201).send();
      } catch (err) {
        console.log(err);
      }
    }
  );

  app.delete("/", async (req, res) => {
    await knex("users").del();

    return res.status(204).send();
  });
};
