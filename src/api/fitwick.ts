// the fitwick ID is just name+number, not a mongoDB ID like the other interfaces
interface IFitwick {
  id: string;
  name: string;
  x: number;
  y: number;
  state: "rest" | "move";
}

export default IFitwick;
