import { User } from './user';

export class Patient extends User {
  lastName: string;
  age: string;
  dni: string;
  healthCareSystem: string;
  profilePicture: string;
  coverPicture: string;

  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: string,
    dni: string,
    healthCareSystem: string,
    profilePicture: string,
    coverPicture: string,
    userType: string
  ) {
    super(id, name, email, userType);
    this.lastName = lastName;
    this.age = age;
    this.dni = dni;
    this.healthCareSystem = healthCareSystem;
    this.profilePicture = profilePicture;
    this.coverPicture = coverPicture;
  }
}
