export class User {
  id: string;
  name: string;
  email: string;
  userType: string;

  constructor(id: string, name: string, email: string, userType: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.userType = userType;
  }
}
