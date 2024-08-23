import { config as databaseConfig } from "@/database/database";

export const config = {
  ...databaseConfig,
  migrations: {
    directory: "./db/migrations", // Caminho para a pasta db na raiz do projeto
  },
};

export default config;
