export class ReviewForSpecialist {
  idPatient: string | null;
  review: string;
  constructor(idPatient: string | null, review: string) {
    this.idPatient = idPatient;
    this.review = review;
  }
}
