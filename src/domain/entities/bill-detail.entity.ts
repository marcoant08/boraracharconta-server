export class BillDetail {
  itemId: string;
  userId: string;
  quantityConsumed: number;
  action: 'join' | 'left';

  constructor(
    itemId: string,
    userId: string,
    quantityConsumed: number,
    action: 'join' | 'left',
  ) {
    this.itemId = itemId;
    this.userId = userId;
    this.quantityConsumed = quantityConsumed;
    this.action = action;
  }
}
