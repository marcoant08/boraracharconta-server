export class Participant {
  userId?: string;
  name: string;
  joinedAt: Date;

  constructor(userId: string | undefined, name: string, joinedAt: Date) {
    this.userId = userId;
    this.name = name;
    this.joinedAt = joinedAt;
  }

  isVisitor(): boolean {
    return !this.userId;
  }
}
