import { Injectable } from '@nestjs/common';

@Injectable()
export class CodeGeneratorService {
  private readonly characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  generateBillCode(): string {
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += this.characters.charAt(
        Math.floor(Math.random() * this.characters.length),
      );
    }
    return code;
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
