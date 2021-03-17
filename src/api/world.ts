import IFitwick from "./fitwick";
import IUser from "./user";

interface IWorld {
  id?: any;
  name: string;
  creatorName: IUser["username"];
  background: string;
  fitwicks?: IFitwick[];
}

export default IWorld;
