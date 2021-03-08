import { Schema, model, Document } from "mongoose";
import IWorld from "../api/world";
import { ModelDefinition } from "./utils";

const worldSchemaDefinition: ModelDefinition<IWorld> = {
  name: {
    type: String,
    unique: true,
    required: true,
  },
};

const worldSchema = new Schema(worldSchemaDefinition, { timestamps: true });

export interface IWorldDocument extends IWorld, Document {}

const worldModel = model<IWorldDocument>("World", worldSchema);

export default worldModel;
