import { Schema, model } from "mongoose";

const worldSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const World = model("World", worldSchema);

export default World;
