export class BillItem {
  id: string;
  name: string;
  value: number;
  quantity: number;
  category: string;

  constructor(
    id: string,
    name: string,
    value: number,
    quantity: number,
    category: string,
  ) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.quantity = quantity;
    this.category = category;
  }
}
