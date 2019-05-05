
class UserProfile {
  public transport:string;
  public name:string;
  public age:number;

  constructor(transport, name, age) {
    this.transport = transport;
    this.name = name;
    this.age= age;
  }
}

export default UserProfile;