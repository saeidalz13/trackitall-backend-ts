import { DataSource } from "typeorm";
import { EnvVars } from "../utils/envVarsParserUtils";
import { User } from "../entity/user";
import { Job } from "../entity/job";
import Token from "../entity/token";

export const newPgDataSource = (envVars: EnvVars): DataSource => {
  const pgDataSource = new DataSource({
    type: "postgres",
    host: envVars.dbHost,
    port: envVars.dbPort,
    username: envVars.psqlUsername,
    password: envVars.psqlPassword,
    database: envVars.dbName,
    migrationsRun: true,
    logging: [
      // "query",
      "info",
      "error",
    ],
    entities: [User, Job, Token],
    synchronize: true,
    // logger: "advanced-console",
    // migrations: ["src/migration/**/*.ts"],
  });

  pgDataSource
    .initialize()
    .then(() => {
      console.log("DataSource initialized!");
    })
    .catch((err) => {
      console.error("Error with DataSource initialization", err);
    });

  return pgDataSource;
};
