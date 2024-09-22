import dotenv from "dotenv";

enum EnvVar {
  PORT = "PORT",
  ALLOWED_ORIGIN = "ALLOWED_ORIGIN",
  DB_HOST = "DB_HOST",
  DB_PORT = "DB_PORT",
  DB_NAME = "DB_NAME",
  POSTGRES_PASSWORD = "POSTGRES_PASSWORD",
  POSTGRES_USERNAME = "POSTGRES_USERNAME",
  JWT_SECRET = "JWT_SECRET",
  OPEN_API_KEY = "OPEN_API_KEY",
}

export interface EnvVars {
  port: number;
  allowedOrigin: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  psqlUsername: string;
  psqlPassword: string;
  jwtSecret: string;
  openApiKey: string;
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
    dbHost: process.env[EnvVar.DB_HOST]!,
    dbPort: parseInt(process.env[EnvVar.DB_PORT]!, 10),
    dbName: process.env[EnvVar.DB_NAME]!,
    psqlUsername: process.env[EnvVar.POSTGRES_USERNAME]!,
    psqlPassword: process.env[EnvVar.POSTGRES_PASSWORD]!,
    jwtSecret: process.env[EnvVar.JWT_SECRET]!,
    openApiKey: process.env[EnvVar.OPEN_API_KEY]!,
  };
};
