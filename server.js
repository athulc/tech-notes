import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./config/corsOptions.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./routes/root.js";
import { logger } from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();
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

app.listen(port, () => console.log(`Server started at ${port}`));
