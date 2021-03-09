// I decided not to implement unique IDs - name+x+y should be enough
// this will result in two identical fitwicks placed on top of each other merging
// but that should never be a serious problem
interface IFitwick {
  name: string;
  x: number;
  y: number;
  state: "rest" | "move";
}

export default IFitwick;
