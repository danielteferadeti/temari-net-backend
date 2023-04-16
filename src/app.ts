import express, {
  Application,
  Request,
  Response,
  NextFunction
} from 'express'

import routes from "./routes";
import errorHandler from "./middlewares/ErrorHandler";
import cookieParser from "cookie-parser";
import expressupload from "express-fileupload";
import cors from "cors";

const app: Application = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(expressupload());
app.use(cors());

app.use("/api/v1/user", routes.userRouter);
app.use("/api/v1/issue", routes.issueRouter);
app.get("/", (req, res) => {
  return res.send("Welcome to a2sv.org Page!");
});

// Error handling
app.use(errorHandler);

export default app;
