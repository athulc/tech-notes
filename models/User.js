import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  roles: [
    {
      type: String,
      default: "Employee",
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
