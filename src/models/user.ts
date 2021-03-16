import { Schema, Document, model } from "mongoose";
import IUser from "../api/user";
import { ModelDefinition } from "./utils";

const pointsSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

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
  createdFitwicks: [
    {
      type: Schema.Types.Map,
      of: Number,
    },
  ],
  datesPoints: [pointsSchema],
  stats: {
    createdWorlds: { type: Number, default: 0 },
    createdTotalObjects: { type: Number, default: 0 },
    createdUniqueObjects: { type: Number, default: 0 },
    createdUniqueWinterObjects: { type: Number, default: 0 },
    createdUniqueToolObjects: { type: Number, default: 0 },
    createdUniqueCookingObjects: { type: Number, default: 0 },
    createdUniqueElectronicsObjects: { type: Number, default: 0 },
    createdUniqueDesertObjects: { type: Number, default: 0 },
    createdUniqueTreeObjects: { type: Number, default: 0 },
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
    delete ret.createdFitwicks;
  },
});

const userModel = model<IUserDocument>("User", userSchema);

export default userModel;
