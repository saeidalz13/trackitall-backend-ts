import express from "express";
import AuthRouter from "./routes/authRouter";
import { authMiddleware } from "./middlewares/auth";
import cors from "cors";
import { buildEnvVars } from "./utils/envVarsParserUtils";
import { newCorsOption } from "./utils/serverUtils";
import { newPgDataSource } from "./db/db";

const envVars = buildEnvVars();
const pgDataSource = newPgDataSource(envVars);

const app = express();

app.use(cors(newCorsOption(envVars.allowedOrigin)));
app.use(express.json());
app.use(authMiddleware.authenticateReq);

app.use(new AuthRouter(pgDataSource).route);

app.listen(envVars.port, () => {
  console.log(`⚡️[server]: listening to ${envVars.port}...`);
});
