import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(join(__dirname, "..", "views", "index.html"));
});

export default router;
