export class Participant {
  userId: string;
  name: string;
  isVisitor: boolean;
  joinedAt: Date;

  constructor(userId: string, name: string, isVisitor: boolean, joinedAt: Date) {
    this.userId = userId;
    this.name = name;
    this.isVisitor = isVisitor;
    this.joinedAt = joinedAt;
  }
}
