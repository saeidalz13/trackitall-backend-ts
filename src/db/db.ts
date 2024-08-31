import { DataSource } from "typeorm";
import { EnvVars } from "../utils/envVarsParserUtils";
import { User } from "../entity/user";

export const newPgDataSource = (envVars: EnvVars): DataSource => {
  const pgDataSource = new DataSource({
    type: "postgres",
    host: envVars.dbHost,
    port: envVars.dbPort,
    username: envVars.psqlUsername,
    password: envVars.psqlPassword,
    database: envVars.dbName,
    migrationsRun: true,
    logging: ["query", "error"],
    logger: "advanced-console",
    synchronize: true,
    entities: [User],
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
