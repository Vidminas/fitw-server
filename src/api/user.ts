interface IUser {
  id?: any;
  emailHash: string;
  username: string;
  groups: any[];
  worlds: any[];
  uniqueObjectList?: string[];
  stats: {
    createdWorlds: number;
    createdTotalObjects: number;
    createdUniqueObjects: number;
    createdUniqueWinterObjects: number;
    createdUniqueToolObjects: number;
    createdUniqueCookingObjects: number;
    createdUniqueElectronicsObjects: number;
    createdUniqueDesertObjects: number;
    createdUniqueTreeObjects: number;
  };
}

export default IUser;
