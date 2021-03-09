import { Schema, model, Document } from "mongoose";
import IFitwick from "../api/fitwick";
import IWorld from "../api/world";
import { ModelDefinition } from "./utils";

const fitwickSchemaDefinition: ModelDefinition<IFitwick> = {
  name: {
    type: String,
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
};
const fitwickSchema = new Schema(fitwickSchemaDefinition);

const worldSchemaDefinition: ModelDefinition<IWorld> = {
  name: {
    type: String,
    unique: true,
    required: true,
  },
  background: String,
  fitwicks: [fitwickSchema],
};
export interface IWorldDocument extends IWorld, Document {}

const worldSchema = new Schema(worldSchemaDefinition, { timestamps: true });
worldSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc: any, ret: IWorldDocument) {
    delete ret._id;
  },
});

const worldModel = model<IWorldDocument>("World", worldSchema);

export default worldModel;
