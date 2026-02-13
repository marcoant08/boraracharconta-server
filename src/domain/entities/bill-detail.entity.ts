export class BillDetail {
  userId: string;
  itemId: string;
  consumedDuringAbsence: number;

  constructor(
    userId: string,
    itemId: string,
    consumedDuringAbsence: number,
  ) {
    this.userId = userId;
    this.itemId = itemId;
    this.consumedDuringAbsence = consumedDuringAbsence;
  }
}
