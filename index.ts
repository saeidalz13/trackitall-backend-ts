import express from "express";
import appRouter from "./routes/routes";
import { authMiddleware } from "./middlewares/auth";
import cors from "cors";
import { buildEnvVars } from "./utils/envVarsParserUtils";
import { newCorsOption } from "./utils/serverUtils";

const envVars = buildEnvVars();
const app = express();

app.use(cors(newCorsOption(envVars.allowedOrigin)));
app.use(express.json());
app.use(authMiddleware.authenticateReq);
app.use(appRouter);

app.listen(envVars.port, () => {
  console.log(`listening to ${envVars.port}...`);
});
