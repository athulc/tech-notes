import expressAsyncHandler from "express-async-handler";
import Note from "../models/Note.js";

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = expressAsyncHandler(async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) {
    return res.status(400).json({ message: "Notes are not found" });
  }
  res.json(notes);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = expressAsyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  //validate fields
  if (!user || !title || !text) {
    res.status(400).json({ message: "All fields are required!" });
  }

  //check for duplicate title
  const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec();
  //Collation will basically make title case insensitive

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  const noteObject = { user, title, text };

  //create and store new note
  const note = await Note.create(noteObject);

  if (!note) {
    return res.status(400).json({ message: `Invalid data provided!` });
  }

  res.status(201).json({ message: `New note ${title} created.` });
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = expressAsyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required!" });
  }

  //find the note already present or not
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found!" });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).collation({ locale: "en", strength: 2 }).lean().exec();

  //Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json({ message: `${updatedNote.title} updated!` });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = expressAsyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Note ID is not found!" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: `Note with ${id} not found!` });
  }

  const result = await note.deleteOne();
  console.log(result);

  res.json({ message: `Note ${result.title} with id: ${result._id} is deleted` });
});

export { getAllNotes, createNewNote, updateNote, deleteNote };
