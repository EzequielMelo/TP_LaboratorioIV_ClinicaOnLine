import { User } from './user';

export class Specialist extends User {
  specialty: string[];
  accountConfirmed: boolean;

  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: string,
    dni: string,
    specialty: string[],
    profilePicture: string,
    accountConfirmed: boolean,
    userType: string
  ) {
    super(id, name, lastName, email, age, dni, profilePicture, userType);
    this.lastName = lastName;
    this.age = age;
    this.specialty = specialty;
    this.accountConfirmed = accountConfirmed;
  }
}
