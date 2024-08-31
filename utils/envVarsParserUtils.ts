import dotenv from "dotenv";

enum EnvVar {
  PORT = "PORT",
  ALLOWED_ORIGIN = "ALLOWED_ORIGIN",
  DB_TYPE = "DB_TYPE",
  DB_HOST = "DB_HOST",
  DB_PORT = "DB_PORT",
  DB_NAME = "DB_NAME",
}

interface EnvVars {
  port: number;
  allowedOrigin: string;
  dbType: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
}

export const buildEnvVars = (): EnvVars => {
  if (dotenv.config().error) {
    console.error("failed to load .env file");
    process.exit(1);
  }

  for (let item in EnvVar) {
    if (process.env[item] === undefined || process.env[item] === "") {
      console.log(`${item} is unavailable in env variables`);
      process.exit(1);
    }
  }

  return {
    port: parseInt(process.env[EnvVar.PORT]!, 10),
    allowedOrigin: process.env[EnvVar.ALLOWED_ORIGIN]!,
    dbType: process.env[EnvVar.DB_TYPE]!,
    dbHost: process.env[EnvVar.DB_HOST]!,
    dbPort: parseInt(process.env[EnvVar.DB_PORT]!, 10),
    dbName: process.env[EnvVar.DB_NAME]!,
  };
};
