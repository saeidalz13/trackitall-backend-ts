import { DataSource } from "typeorm";
import { EnvVars } from "../utils/envVarsParserUtils";
import { User } from "../entity/user";
import { Job } from "../entity/job";
import Token from "../entity/token";
import { ApiLogger } from "../utils/serverUtils";

export const newPgDataSource = async (
  envVars: EnvVars
): Promise<DataSource | null> => {
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

  try {
    const dataSource = await pgDataSource.initialize();
    ApiLogger.log("DataSource initialized!");
    return dataSource;
  } catch (err) {
    ApiLogger.error(`Error with DataSource initialization: ${err}`);
    return null;
  }
};
