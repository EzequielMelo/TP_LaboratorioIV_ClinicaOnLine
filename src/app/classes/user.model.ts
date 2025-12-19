// user.model.ts
import { Timestamp } from '@angular/fire/firestore';

export class User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  age: Timestamp;
  dni: string;
  profilePicture: string;
  userType: 'admin' | 'patient' | 'specialist';

  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: Timestamp,
    dni: string,
    profilePicture: string,
    userType: 'admin' | 'patient' | 'specialist'
  ) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.age = age;
    this.dni = dni;
    this.profilePicture = profilePicture;
    this.userType = userType;
  }
}

// Interfaces específicas que agregan sus campos
export interface Admin extends User {
  userType: 'admin';
}

export interface Patient extends User {
  userType: 'patient';
  healthCareSystem: string;
  coverPicture: string;
  userData: any;
}

export interface Specialist extends User {
  userType: 'specialist';
  specialty: string[];
  accountConfirmed: boolean;
  workDays: string[];
  workHours: { start: string; end: string };
}

// Unión de todos los tipos
export type AppUser = Admin | Patient | Specialist;
