export class User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  age: string;
  dni: string;
  profilePicture: string;
  userType: string;

  constructor(
    id: string,
    name: string,
    lastName: string,
    email: string,
    age: string,
    dni: string,
    profilePicture: string,
    userType: string
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
