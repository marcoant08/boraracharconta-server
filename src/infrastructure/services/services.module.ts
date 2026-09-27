import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { CodeGeneratorService } from './code-generator.service';
import { EmailService } from './email.service';
import { OAuthService } from './oauth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('jwt.expiresIn') || '24h';
        return {
          secret: configService.get<string>('jwt.secret'),
          signOptions: { expiresIn: expiresIn as '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    PasswordService,
    JwtService,
    CodeGeneratorService,
    EmailService,
    OAuthService,
  ],
  exports: [
    PasswordService,
    JwtService,
    CodeGeneratorService,
    EmailService,
    OAuthService,
  ],
})
export class ServicesModule {}
