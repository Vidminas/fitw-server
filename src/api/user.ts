interface IUser {
  id?: any;
  emailHash: string;
  username: string;
  groups: any[];
  worlds: any[];
  createdFitwicks?: Map<string, number>;
  datesPoints: {
    date: Date;
    points: number;
  }[];
  winningStreak: number;
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
