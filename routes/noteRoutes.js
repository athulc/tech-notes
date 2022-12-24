import express from "express";
import { createNewNote, deleteNote, getAllNotes, updateNote } from "../controllers/notesController.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").get(getAllNotes).post(createNewNote).patch(updateNote).delete(deleteNote);

export default router;
