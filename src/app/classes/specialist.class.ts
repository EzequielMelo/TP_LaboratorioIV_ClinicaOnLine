import { User } from './user';

export class Specialist extends User {
  lastName: string;
  age: number;
  specialty: string;
  profilePicture: string;

  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: number,
    specialty: string,
    profilePicture: string,
    userType: string
  ) {
    super(id, name, email, userType);
    this.lastName = lastName;
    this.age = age;
    this.specialty = specialty;
    this.profilePicture = profilePicture;
  }
}
