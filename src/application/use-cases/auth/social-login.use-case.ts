import { Inject, Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { JwtService } from '@infrastructure/services/jwt.service';
import { OAuthProfile } from '@infrastructure/services/oauth.service';
import { OAuthLoginError } from '@domain/errors/oauth-login.error';

@Injectable()
export class SocialLoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    profile: OAuthProfile,
  ): Promise<{ accessToken: string; user: { id: string; email: string; name: string } }> {
    if (!profile.providerId) {
      throw new OAuthLoginError('oauth_failed');
    }

    if (!profile.email || !profile.emailVerified) {
      throw new OAuthLoginError('email_required');
    }

    const byProvider = await this.userRepository.findByProvider(
      profile.provider,
      profile.providerId,
    );

    if (byProvider) {
      return this.issueToken(byProvider);
    }

    const byEmail = await this.userRepository.findByEmailCaseInsensitive(
      profile.email,
    );

    if (byEmail) {
      if (!byEmail.emailVerified) {
        throw new OAuthLoginError('email_unverified');
      }

      const alreadyLinked = byEmail.providers.find(
        (identity) => identity.provider === profile.provider,
      );

      if (alreadyLinked && alreadyLinked.providerId !== profile.providerId) {
        throw new OAuthLoginError('oauth_failed');
      }

      if (!alreadyLinked) {
        const linked = new User(
          byEmail.id,
          byEmail.email,
          byEmail.password,
          byEmail.name,
          byEmail.emailVerified,
          byEmail.emailVerificationCode,
          byEmail.createdAt,
          new Date(),
          [
            ...byEmail.providers,
            { provider: profile.provider, providerId: profile.providerId },
          ],
        );
        const saved = await this.userRepository.update(linked);
        return this.issueToken(saved);
      }

      return this.issueToken(byEmail);
    }

    const created = await this.userRepository.create(
      new User(
        '',
        profile.email,
        null,
        profile.name,
        true,
        '',
        new Date(),
        new Date(),
        [{ provider: profile.provider, providerId: profile.providerId }],
      ),
    );

    return this.issueToken(created);
  }

  private async issueToken(user: User): Promise<{
    accessToken: string;
    user: { id: string; email: string; name: string };
  }> {
    const accessToken = await this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
