import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { VerifyEmailUseCase } from '@application/use-cases/auth/verify-email.use-case';
import { ResendVerificationCodeUseCase } from '@application/use-cases/auth/resend-verification-code.use-case';
import { SocialLoginUseCase } from '@application/use-cases/auth/social-login.use-case';
import { OAuthLoginError } from '@domain/errors/oauth-login.error';
import { AuthProviderName } from '@domain/entities/user.entity';
import { OAuthService } from '@infrastructure/services/oauth.service';
import { LoginDto } from '../dto/auth/login.dto';
import { VerifyEmailDto } from '../dto/auth/verify-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationCodeUseCase: ResendVerificationCodeUseCase,
    private readonly socialLoginUseCase: SocialLoginUseCase,
    private readonly oauthService: OAuthService,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Iniciar login com Google' })
  @ApiResponse({ status: 302, description: 'Redireciona para o Google' })
  async googleAuth(
    @Query('returnTo') returnTo: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.startOAuth('google', returnTo, req, res);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Callback do login com Google' })
  @ApiResponse({ status: 302, description: 'Redireciona para o frontend' })
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.finishOAuth('google', code, state, error, req, res);
  }

  @Get('github')
  @ApiOperation({ summary: 'Iniciar login com GitHub' })
  @ApiResponse({ status: 302, description: 'Redireciona para o GitHub' })
  async githubAuth(
    @Query('returnTo') returnTo: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.startOAuth('github', returnTo, req, res);
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Callback do login com GitHub' })
  @ApiResponse({ status: 302, description: 'Redireciona para o frontend' })
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.finishOAuth('github', code, state, error, req, res);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiResponse({ status: 400, description: 'Email não verificado' })
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email com código' })
  @ApiResponse({ status: 200, description: 'Email verificado com sucesso' })
  @ApiResponse({ status: 400, description: 'Código inválido ou email já verificado' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(
      verifyEmailDto.email,
      verifyEmailDto.code,
    );
  }

  @Post('resend-verification-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar código de verificação' })
  @ApiResponse({ status: 200, description: 'Código reenviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Email já verificado ou usuário não encontrado' })
  async resendVerificationCode(@Body() body: { email: string }) {
    return this.resendVerificationCodeUseCase.execute(body.email);
  }

  private async startOAuth(
    provider: AuthProviderName,
    returnTo: string,
    req: Request,
    res: Response,
  ) {
    const requestBaseUrl = this.requestBaseUrl(req);

    try {
      const url = await this.oauthService.buildAuthorizationUrl(provider, {
        returnTo,
        requestBaseUrl,
      });
      res.redirect(url);
    } catch (error) {
      res.redirect(
        this.oauthService.buildErrorRedirect(this.errorCode(error), returnTo),
      );
    }
  }

  private async finishOAuth(
    provider: AuthProviderName,
    code: string,
    state: string,
    error: string,
    req: Request,
    res: Response,
  ) {
    const frontendOrigin = state
      ? await this.oauthService.readFrontendOrigin(state, provider)
      : undefined;
    const requestBaseUrl = this.requestBaseUrl(req);

    if (error || !code || !state) {
      res.redirect(this.oauthService.buildErrorRedirect('oauth_denied', frontendOrigin));
      return;
    }

    try {
      const profile = await this.oauthService.fetchProfile(
        provider,
        code,
        state,
        requestBaseUrl,
      );
      const result = await this.socialLoginUseCase.execute(profile);
      res.redirect(this.oauthService.buildSuccessRedirect(result, frontendOrigin));
    } catch (callbackError) {
      res.redirect(
        this.oauthService.buildErrorRedirect(
          this.errorCode(callbackError),
          frontendOrigin,
        ),
      );
    }
  }

  private requestBaseUrl(req: Request): string {
    const forwardedProto = this.firstHeader(req.headers['x-forwarded-proto']);
    const proto = forwardedProto || req.protocol || 'http';
    const host = this.firstHeader(req.headers['x-forwarded-host']) || req.get('host');
    return `${proto}://${host}`;
  }

  private firstHeader(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
      return value[0] || '';
    }

    return value?.split(',')[0]?.trim() || '';
  }

  private errorCode(error: unknown): string {
    if (error instanceof OAuthLoginError) {
      return error.code;
    }

    return 'oauth_failed';
  }
}
