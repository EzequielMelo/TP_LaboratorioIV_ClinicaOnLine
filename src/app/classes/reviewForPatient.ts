export class Review {
  healthRecordId: string | null;
  review: string;
  constructor(healthRecordId: string | null, review: string) {
    this.healthRecordId = healthRecordId;
    this.review = review;
  }
}
