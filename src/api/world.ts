import IFitwick from "./fitwick";

interface IWorld {
  id?: any;
  name: string;
  background: string;
  fitwicks: IFitwick[];
}

export default IWorld;
