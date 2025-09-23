export class HealthRecord {
  id: string;
  idPatient: string;
  idSpecialist: string;
  height: number;
  weight: number;
  bloodPressure: string;
  temperature: number;

  // nuevos campos
  painLevel: number; // rango 0–100
  glucoseLevel: number; // numérico
  smoker: boolean; // sí/no

  dynamicData: { [key: string]: string | number };

  constructor(
    id: string,
    idPatient: string,
    idSpecialist: string,
    height: number,
    weight: number,
    bloodPressure: string,
    temperature: number,
    painLevel: number,
    glucoseLevel: number,
    smoker: boolean,
    dynamicData: { [key: string]: string | number }
  ) {
    this.id = id;
    this.idPatient = idPatient;
    this.idSpecialist = idSpecialist;
    this.height = height;
    this.weight = weight;
    this.bloodPressure = bloodPressure;
    this.temperature = temperature;

    this.painLevel = painLevel;
    this.glucoseLevel = glucoseLevel;
    this.smoker = smoker;

    this.dynamicData = dynamicData;
  }
}
