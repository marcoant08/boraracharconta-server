import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProviderName } from '@domain/entities/user.entity';

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

  async signOAuthState(
    provider: AuthProviderName,
    returnTo: string,
  ): Promise<string> {
    return this.nestJwtService.signAsync(
      { purpose: 'oauth-state', provider, returnTo },
      { expiresIn: '10m' },
    );
  }

  async verifyOAuthState(
    token: string,
  ): Promise<{ provider: AuthProviderName; returnTo: string }> {
    const payload = await this.nestJwtService.verifyAsync<{
      purpose?: string;
      provider?: string;
      returnTo?: string;
    }>(token);

    if (
      payload.purpose !== 'oauth-state' ||
      (payload.provider !== 'google' && payload.provider !== 'github')
    ) {
      throw new Error('invalid_state');
    }

    return {
      provider: payload.provider,
      returnTo: payload.returnTo || '',
    };
  }
}
