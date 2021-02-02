import { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const Group = model("Group", groupSchema);

export default Group;
