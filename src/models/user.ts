import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    publicName: {
      type: String,
      unique: false,
      required: true,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    worlds: [
      {
        type: Schema.Types.ObjectId,
        ref: "World",
      },
    ],
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
