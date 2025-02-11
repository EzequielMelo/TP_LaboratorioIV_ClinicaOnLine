export class HealthRecord {
  id: string;
  idPatient: string;
  idSpecialist: string;
  height: number;
  weight: number;
  bloodPressure: number;
  temperature: number;
  dynamicData: { [key: string]: string | number };

  constructor(
    id: string,
    idPatient: string,
    idSpecialist: string,
    height: number,
    weight: number,
    bloodPressure: number,
    temperature: number,
    dynamicData: { [key: string]: string | number }
  ) {
    this.id = id;
    this.idPatient = idPatient;
    this.idSpecialist = idSpecialist;
    this.height = height;
    this.weight = weight;
    this.bloodPressure = bloodPressure;
    this.temperature = temperature;
    this.dynamicData = dynamicData;
  }
}
