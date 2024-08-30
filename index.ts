import express from "express";
import appRouter from "./routes/routes";
import dotenv from "dotenv";
import { authMiddleware } from "./middlewares/auth";
import cors, {CorsOptions} from "cors"
import { constants } from "http2";

// Cors
const corsOptions: CorsOptions = {
  optionsSuccessStatus: constants.HTTP_STATUS_OK,
  origin: "http://localhost:5173"
}

// Env Vars
const result = dotenv.config();
if (result.error) {
  console.error("failed to load .env file");
  process.exit(1);
}
const port = parseInt(process.env.PORT || '3000', 10);

// Running Express App
const app = express();

app.use(cors(corsOptions))
app.use(express.json());
app.use(authMiddleware.authenticateReq)
app.use(appRouter);


app.listen(port, () => {
  console.log(`listening to ${port}...`);
});
