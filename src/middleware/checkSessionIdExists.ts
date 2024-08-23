import { FastifyReply, FastifyRequest } from "fastify";

export const checkSessionIdExists = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const sessionID = req.cookies.sessionId;

  if (!sessionID) {
    return res.status(401).send({
      error: "Unauthorized.",
    });
  }
};
