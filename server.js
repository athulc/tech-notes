import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./config/corsOptions.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { logger, logEvents } from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import routes from "./routes/root.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notesRoutes from "./routes/noteRoutes.js";
import { connectDB } from "./config/dbConn.js";

const app = express();

console.log(process.env.NODE_ENV);
connectDB();

const port = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Custom Middleware */
app.use(logger);

/* Built-in Middleware */
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(join(__dirname, "public")));

app.use("/", routes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/notes", notesRoutes);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => console.log(`Server started at ${port}`));
});

mongoose.connection.on("error", (err) => {
  console.error(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, "mongoErrLog.log");
});
