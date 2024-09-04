import express from "express";
import AuthRouter from "./routes/authRouter";
import cors from "cors";
import { buildEnvVars } from "./utils/envVarsParserUtils";
import { newCorsOption } from "./utils/serverUtils";
import { newPgDataSource } from "./db/db";
import cookieParser from "cookie-parser";
import JobRouter from "./routes/jobRouter";

const envVars = buildEnvVars();
const pgDataSource = newPgDataSource(envVars);

const app = express();

app.use(cookieParser());
app.use(cors(newCorsOption(envVars.allowedOrigin)));
app.use(express.json());

app.use(new AuthRouter(pgDataSource, envVars.jwtSecret).route());
app.use(new JobRouter(envVars.jwtSecret).route());

app.listen(envVars.port, () => {
  console.log(`⚡️[server]: listening to ${envVars.port}...`);
});
