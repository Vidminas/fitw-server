// the fitwick ID is just name+number, not a mongoDB ID like the other interfaces
interface IFitwick {
  worldId: string;
  name: string;
  x: number;
  y: number;
  atlasTexture: string;
  atlasFrame: string;
}

export default IFitwick;
