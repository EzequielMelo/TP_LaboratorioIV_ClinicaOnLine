import { User } from './user';

export class Patient extends User {
  healthCareSystem: string;
  coverPicture: string;
  userData: any;

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
    super(id, name, lastName, email, age, dni, profilePicture, userType);
    this.lastName = lastName;
    this.age = age;
    this.dni = dni;
    this.healthCareSystem = healthCareSystem;
    this.coverPicture = coverPicture;
  }
}
