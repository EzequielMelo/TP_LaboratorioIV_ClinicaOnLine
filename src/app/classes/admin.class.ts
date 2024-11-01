import { User } from './user';

export class Admin extends User {
  constructor(id: string, name: string, email: string, userType: string) {
    super(id, name, email, userType);
  }
}
