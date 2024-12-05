import { User } from './user';

export class Specialist extends User {
  specialty: string[];
  accountConfirmed: boolean;
  workDays: string[];
  workHours: { start: string; end: string };

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
    workDays: string[],
    workHours: { start: string; end: string },
    userType: string
  ) {
    super(id, name, lastName, email, age, dni, profilePicture, userType);
    this.specialty = specialty;
    this.accountConfirmed = accountConfirmed;
    this.workDays = workDays;
    this.workHours = workHours;
  }
}
