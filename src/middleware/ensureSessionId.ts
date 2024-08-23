import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";

export const ensureSessionId = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  let sessionId = req.cookies.sessionId;

  if (!sessionId) {
    sessionId = randomUUID();

    res.cookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 7, // 7 days
    });
  }

  req.cookies.sessionId = sessionId;
};
