import express from "express";
import cors from "cors";
import { buildEnvVars } from "./utils/envVarsParserUtils";
import {
  ApiLogger,
  deleteExpiredTokens,
  newCorsOption,
} from "./utils/serverUtils";
import { newPgDataSource } from "./db/db";
import cookieParser from "cookie-parser";
import newJobRouter from "./routes/jobRouter";
import cron from "node-cron";
import newAuthRouter from "./routes/authRouter";
import newAiRouter from "./routes/aiRouter";
import newFsRouter from "./routes/fsRouter";

const envVars = buildEnvVars();
const pgDataSource = await newPgDataSource(envVars);
if (!pgDataSource) {
  process.exit(0);
}

const app = express();

// */5 * * * * -> Every 5 mins
cron.schedule("*/5 * * * *", async () => {
  try {
    ApiLogger.log("Running token clean up...");
    await deleteExpiredTokens(pgDataSource);
  } catch (error) {
    ApiLogger.error(error);
  }
});

app.use(cookieParser());
app.use(cors(newCorsOption(envVars.allowedOrigin)));
app.use(express.json());

app.use(newAuthRouter(pgDataSource, envVars.jwtSecret));
app.use(newAiRouter(pgDataSource, envVars.openApiKey));
app.use(newFsRouter(pgDataSource, envVars.jwtSecret));
app.use(newJobRouter(pgDataSource, envVars.jwtSecret));

app.listen(envVars.port, () => {
  ApiLogger.log(`⚡️[server]: listening to ${envVars.port}...`);
});
