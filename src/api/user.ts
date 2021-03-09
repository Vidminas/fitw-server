interface IUser {
  id?: any;
  emailHash: string;
  username: string;
  groups: any[];
  worlds: any[];
}

export default IUser;
