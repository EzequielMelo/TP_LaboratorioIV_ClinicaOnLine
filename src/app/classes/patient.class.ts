import { User } from './user';

export class Patient extends User {
  healthCareSystem: string;
  coverPicture: string;
  settings: { useCaptcha: boolean };

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
    userType: string,
    settings: { useCaptcha: boolean }
  ) {
    super(id, name, lastName, email, age, dni, profilePicture, userType);
    this.healthCareSystem = healthCareSystem;
    this.coverPicture = coverPicture;
    this.settings = settings;
  }
}
