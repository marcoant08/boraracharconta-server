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

  async buildAuthorizationUrl(
    provider: AuthProviderName,
    options?: { returnTo?: string; requestBaseUrl?: string },
  ): Promise<string> {
    const config = this.getProviderConfig(provider);
    const callbackUrl = this.resolveCallbackUrl(
      provider,
      config.callbackUrl,
      options?.requestBaseUrl,
    );
    const returnTo = this.resolveFrontendOrigin(options?.returnTo);
    const state = await this.jwtService.signOAuthState(provider, returnTo);

    if (provider === 'google') {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', config.clientId);
      url.searchParams.set('redirect_uri', callbackUrl);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid email profile');
      url.searchParams.set('state', state);
      return url.toString();
    }

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', callbackUrl);
    url.searchParams.set('scope', 'user:email');
    url.searchParams.set('state', state);
    return url.toString();
  }

  async fetchProfile(
    provider: AuthProviderName,
    code: string,
    state: string,
    requestBaseUrl?: string,
  ): Promise<OAuthProfile> {
    await this.assertState(state, provider);
    const callbackUrl = this.resolveCallbackUrl(
      provider,
      this.getProviderConfig(provider).callbackUrl,
      requestBaseUrl,
    );

    if (provider === 'google') {
      return this.fetchGoogleProfile(code, callbackUrl);
    }

    return this.fetchGitHubProfile(code, callbackUrl);
  }

  async readFrontendOrigin(
    state: string,
    provider: AuthProviderName,
  ): Promise<string> {
    try {
      return await this.assertState(state, provider);
    } catch {
      return this.configuredFrontendOrigin();
    }
  }

  buildSuccessRedirect(
    result: {
      accessToken: string;
      user: { id: string; email: string; name: string };
    },
    frontendOrigin?: string,
  ): string {
    const hash = new URLSearchParams({
      accessToken: result.accessToken,
      user: JSON.stringify(result.user),
    });

    return `${this.resolveFrontendOrigin(frontendOrigin)}/auth/callback#${hash.toString()}`;
  }

  buildErrorRedirect(code: string, frontendOrigin?: string): string {
    const params = new URLSearchParams({ error: code });
    return `${this.resolveFrontendOrigin(frontendOrigin)}/auth/callback?${params.toString()}`;
  }

  private async assertState(
    state: string,
    provider: AuthProviderName,
  ): Promise<string> {
    try {
      const payload = await this.jwtService.verifyOAuthState(state);
      if (payload.provider !== provider) {
        throw new OAuthLoginError('invalid_state');
      }
      return this.resolveFrontendOrigin(payload.returnTo);
    } catch (error) {
      if (error instanceof OAuthLoginError) {
        throw error;
      }
      throw new OAuthLoginError('invalid_state');
    }
  }

  private async fetchGoogleProfile(
    code: string,
    callbackUrl: string,
  ): Promise<OAuthProfile> {
    const config = this.getProviderConfig('google');
    const body = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: callbackUrl,
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

  private async fetchGitHubProfile(
    code: string,
    callbackUrl: string,
  ): Promise<OAuthProfile> {
    const config = this.getProviderConfig('github');
    const body = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: callbackUrl,
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

  private resolveCallbackUrl(
    provider: AuthProviderName,
    configuredCallbackUrl: string,
    requestBaseUrl?: string,
  ): string {
    const requestOrigin = this.normalizeOrigin(requestBaseUrl);
    if (
      requestOrigin &&
      !this.isLocalOrigin(requestOrigin) &&
      this.isLocalUrl(configuredCallbackUrl)
    ) {
      return `${requestOrigin}/auth/${provider}/callback`;
    }

    return configuredCallbackUrl;
  }

  private resolveFrontendOrigin(returnTo?: string): string {
    const fallback = this.configuredFrontendOrigin();
    const candidate = this.normalizeOrigin(returnTo);
    if (!candidate || !this.isAllowedFrontendOrigin(candidate)) {
      return fallback;
    }

    return candidate;
  }

  private isAllowedFrontendOrigin(origin: string): boolean {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    if (this.isLocalHostname(url.hostname)) {
      return true;
    }

    const configured = this.configuredFrontendOrigins();
    const publicOrigins = configured.filter((item) => !this.isLocalOrigin(item));
    if (publicOrigins.length > 0) {
      return publicOrigins.includes(origin);
    }

    return url.protocol === 'https:';
  }

  private configuredFrontendOrigin(): string {
    return this.configuredFrontendOrigins()[0] || 'http://localhost:3001';
  }

  private configuredFrontendOrigins(): string[] {
    const raw = this.configService.get<string>('oauth.frontendUrl') || '';
    return raw
      .split(',')
      .map((item) => this.normalizeOrigin(item))
      .filter((item): item is string => Boolean(item));
  }

  private normalizeOrigin(value?: string): string | null {
    if (!value) {
      return null;
    }

    try {
      const url = new URL(value);
      if (url.username || url.password) {
        return null;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return null;
      }
      return url.origin;
    } catch {
      return null;
    }
  }

  private isLocalUrl(value: string): boolean {
    const origin = this.normalizeOrigin(value);
    return !origin || this.isLocalOrigin(origin);
  }

  private isLocalOrigin(origin: string): boolean {
    try {
      return this.isLocalHostname(new URL(origin).hostname);
    } catch {
      return false;
    }
  }

  private isLocalHostname(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
}
