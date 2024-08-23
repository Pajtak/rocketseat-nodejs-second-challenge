import { FastifyRequest, FastifyReply } from "fastify";
import { knex } from "../database/database";

export const checkUserId = async (req: FastifyRequest, res: FastifyReply) => {
  const { sessionId } = req.cookies;

  if (!sessionId) {
    return res.status(401).send({ error: "Unauthorized: No session ID" });
  }

  const user = await knex("users").where("session_id", sessionId).first();

  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }

  // Attach the user_id to the request object
  req.user_id = user.id;
};
