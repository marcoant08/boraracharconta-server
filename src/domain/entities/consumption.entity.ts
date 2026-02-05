export class Consumption {
  participantId: string;
  itemId: string;
  quantity?: number;

  constructor(participantId: string, itemId: string, quantity?: number) {
    this.participantId = participantId;
    this.itemId = itemId;
    this.quantity = quantity ?? 1;
  }
}
