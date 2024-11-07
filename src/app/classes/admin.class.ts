import { User } from './user';

export class Admin extends User {
  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: string,
    dni: string,
    profilePicture: string,
    userType: string
  ) {
    super(id, name, lastName, email, age, dni, profilePicture, userType);
  }
}
