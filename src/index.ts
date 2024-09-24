import express from "express";
import AuthRouter from "./routes/authRouter";
import cors from "cors";
import { buildEnvVars } from "./utils/envVarsParserUtils";
import {
  ApiLogger,
  deleteExpiredTokens,
  newCorsOption,
} from "./utils/serverUtils";
import { newPgDataSource } from "./db/db";
import cookieParser from "cookie-parser";
import JobRouter from "./routes/jobRouter";
import cron from "node-cron";
import AiRouter from "./routes/aiRouter";
import FsRouter from "./routes/fsRouter";
import NewAuthRouter from "./routes/authRouter";
import NewAiRouter from "./routes/aiRouter";

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

app.use(NewAuthRouter(pgDataSource, envVars.jwtSecret));
app.use(NewAiRouter(pgDataSource, envVars.openApiKey));
app.use(new FsRouter(pgDataSource, envVars.jwtSecret).route());
app.use(new JobRouter(envVars.jwtSecret, pgDataSource).route());

app.listen(envVars.port, () => {
  ApiLogger.log(`⚡️[server]: listening to ${envVars.port}...`);
});
