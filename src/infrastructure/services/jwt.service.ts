import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    private nestJwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

  async sign(payload: { sub: string; email: string }): Promise<string> {
    return this.nestJwtService.signAsync(payload);
  }

  async verify(token: string): Promise<{ sub: string; email: string }> {
    return this.nestJwtService.verifyAsync(token);
  }
}
