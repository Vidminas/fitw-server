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
  uniqueObjectList: [String],
  stats: {
    createdWorlds: { type: Number },
    createdTotalObjects: { type: Number },
    createdUniqueObjects: { type: Number },
    createdUniqueWinterObjects: { type: Number },
    createdUniqueToolObjects: { type: Number },
    createdUniqueCookingObjects: { type: Number },
    createdUniqueElectronicsObjects: { type: Number },
    createdUniqueDesertObjects: { type: Number },
    createdUniqueTreeObjects: { type: Number },
  },
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
    delete ret.uniqueObjectList;
  },
});

const userModel = model<IUserDocument>("User", userSchema);

export default userModel;
