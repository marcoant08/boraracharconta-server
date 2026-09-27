import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthProviderName } from '@domain/entities/user.entity';
import { OAuthLoginError } from '@domain/errors/oauth-login.error';
import { JwtService } from './jwt.service';

export interface OAuthProfile {
  provider: AuthProviderName;
  providerId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async buildAuthorizationUrl(provider: AuthProviderName): Promise<string> {
    const config = this.getProviderConfig(provider);
    const state = await this.jwtService.signOAuthState(provider);

    if (provider === 'google') {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', config.callbackUrl);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid email profile');
      url.searchParams.set('state', state);
      return url.toString();
    }

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.callbackUrl);
    url.searchParams.set('scope', 'user:email');
    url.searchParams.set('state', state);
    return url.toString();
  }

  async fetchProfile(
    provider: AuthProviderName,
    code: string,
    state: string,
  ): Promise<OAuthProfile> {
    await this.assertState(state, provider);

    if (provider === 'google') {
      return this.fetchGoogleProfile(code);
    }

    return this.fetchGitHubProfile(code);
  }

  buildSuccessRedirect(result: {
    accessToken: string;
    user: { id: string; email: string; name: string };
  }): string {
    const hash = new URLSearchParams({
      accessToken: result.accessToken,
      user: JSON.stringify(result.user),
    });

    return `${this.frontendUrl()}/auth/callback#${hash.toString()}`;
  }

  buildErrorRedirect(code: string): string {
    const params = new URLSearchParams({ error: code });
    return `${this.frontendUrl()}/auth/callback?${params.toString()}`;
  }

  private async assertState(
    state: string,
    provider: AuthProviderName,
  ): Promise<void> {
    try {
      const stateProvider = await this.jwtService.verifyOAuthState(state);
      if (stateProvider !== provider) {
        throw new OAuthLoginError('invalid_state');
      }
    } catch (error) {
      if (error instanceof OAuthLoginError) {
        throw error;
      }
      throw new OAuthLoginError('invalid_state');
    }
  }

  private async fetchGoogleProfile(code: string): Promise<OAuthProfile> {
    const config = this.getProviderConfig('google');
    const body = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenResponse.ok) {
      throw new OAuthLoginError('oauth_failed');
    }

    const tokenJson = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      throw new OAuthLoginError('oauth_failed');
    }

    const profileResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
    );

    if (!profileResponse.ok) {
      throw new OAuthLoginError('oauth_failed');
    }

    const profile = (await profileResponse.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
    };

    const email = profile.email?.trim().toLowerCase() || '';
    const emailVerified =
      profile.email_verified === true || profile.email_verified === 'true';

    return {
      provider: 'google',
      providerId: profile.sub || '',
      email,
      emailVerified,
      name: profile.name?.trim() || this.nameFromEmail(email),
    };
  }

  private async fetchGitHubProfile(code: string): Promise<OAuthProfile> {
    const config = this.getProviderConfig('github');
    const body = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.callbackUrl,
    });

    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );

    if (!tokenResponse.ok) {
      throw new OAuthLoginError('oauth_failed');
    }

    const tokenJson = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenJson.access_token || tokenJson.error) {
      throw new OAuthLoginError('oauth_failed');
    }

    const headers = {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'finances-server',
    };

    const [userResponse, emailsResponse] = await Promise.all([
      fetch('https://api.github.com/user', { headers }),
      fetch('https://api.github.com/user/emails', { headers }),
    ]);

    if (!userResponse.ok || !emailsResponse.ok) {
      throw new OAuthLoginError('oauth_failed');
    }

    const user = (await userResponse.json()) as {
      id?: number;
      name?: string;
      login?: string;
    };
    const emails = (await emailsResponse.json()) as GitHubEmail[];
    const verifiedEmail = this.pickGitHubEmail(emails);

    return {
      provider: 'github',
      providerId: user.id ? String(user.id) : '',
      email: verifiedEmail,
      emailVerified: Boolean(verifiedEmail),
      name: user.name?.trim() || user.login?.trim() || this.nameFromEmail(verifiedEmail),
    };
  }

  private pickGitHubEmail(emails: GitHubEmail[]): string {
    if (!Array.isArray(emails)) {
      return '';
    }

    const verified = emails.filter((item) => item.verified && item.email);
    const primary = verified.find((item) => item.primary);
    return (primary || verified[0])?.email.trim().toLowerCase() || '';
  }

  private nameFromEmail(email: string): string {
    const localPart = email.split('@')[0]?.trim();
    return localPart || 'Usuário';
  }

  private getProviderConfig(provider: AuthProviderName): OAuthProviderConfig {
    const config = this.configService.get<OAuthProviderConfig>(
      `oauth.${provider}`,
    );

    if (!config?.clientId || !config.clientSecret || !config.callbackUrl) {
      throw new OAuthLoginError('oauth_not_configured');
    }

    return config;
  }

  private frontendUrl(): string {
    const url =
      this.configService.get<string>('oauth.frontendUrl') ||
      'http://localhost:3000';
    return url.replace(/\/$/, '');
  }
}
