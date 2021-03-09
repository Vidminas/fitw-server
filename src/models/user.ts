import { Schema, Document, model } from "mongoose";
import IUser from "../api/user";
import { ModelDefinition } from "./utils";

const userSchemaDefinition: ModelDefinition<IUser> = {
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
};

export interface IUserDocument extends IUser, Document {
  groups: Schema.Types.ObjectId[];
  worlds: Schema.Types.ObjectId[];
}

const userSchema = new Schema(userSchemaDefinition, { timestamps: true });
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: IUserDocument) {
    delete ret._id;
  },
});

const userModel = model<IUserDocument>("User", userSchema);

export default userModel;
