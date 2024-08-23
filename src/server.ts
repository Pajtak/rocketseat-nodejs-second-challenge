import { app } from "./app";
import { env } from "./env";

const PORT = env.PORT;
app
  .listen({
    port: PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(`Projeto rodando na porta ${PORT}`);
  });
