import { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  emailHash: string;
  username: string;
  groups: [Schema.Types.ObjectId];
  worlds: [Schema.Types.ObjectId];
}

const userSchema = new Schema(
  {
    emailHash: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
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

const userModel = model<IUser>("User", userSchema);

export default userModel;
