/**
 * This file serves as the entry point for the backend server of the Trusted Issuer Registry application.
 * It imports necessary dependencies, sets up the server, and defines the routes.
 */
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import createError from "http-errors";
import cors from "cors";

import "./cron/tirCronJobs.js";

import { router as tirRoute } from "./routes/resolveTirRoute.js";
import { router as setAutoResolveRoute } from "./routes/setAutoResolveRoute.js";
import { router as verifyIssuerRoute } from "./routes/verifyIssuerRoute.js";
import { router as resolveSingleTIR } from "./routes/resolveSingleTir.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
console.log("Port: " + process.env.REDIS_PORT);

// CORS: Allow localhost and the host specified in .env
var corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:80",
    process.env.FRONTEND_HOST ?? "",
  ],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("The server is running!");
});
app.use("/", tirRoute);
app.use("/", setAutoResolveRoute);
app.use("/", verifyIssuerRoute);
app.use("/", resolveSingleTIR);

/**
 * Starts the server and listens on the specified port.
 */
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

////////////////////////////

/**
 * Middleware to catch 404 errors and forward to the error handler.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
app.use(function (req, res, next) {
  next(createError(404));
});

export default app;
