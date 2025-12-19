import { User } from './user';
import { Timestamp } from '@angular/fire/firestore';

export class Admin extends User {
  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: Timestamp,
    dni: string,
    profilePicture: string,
    userType: string
  ) {
    super(id, name, lastName, email, age, dni, profilePicture, userType);
  }
}
