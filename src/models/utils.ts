// Types borrowed from https://stackoverflow.com/questions/34482136/mongoose-the-typescript-way
// With some of my own extensions
// This ensures that mongoose schema and interface will match

type IsRequired<T> = undefined extends T ? false : true;
type IsUnique<T> = undefined extends T ? false : true;

type FieldType<T> = T extends number
  ? typeof Number
  : T extends string
  ? typeof String
  : Object;

type Field<T> =
  | {
      type: FieldType<T>;
      required?: IsRequired<T>;
      unique?: IsUnique<T>;
      ref?: string;
    }
  | FieldType<T>;

export type ModelDefinition<M> = {
  [P in keyof M as Exclude<P, "id">]-?: M[P] extends Array<infer U>
    ? Array<Field<U>>
    : Field<M[P]>;
};
