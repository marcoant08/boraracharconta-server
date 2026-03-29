import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('resend.apiKey'));
    this.from = this.configService.get<string>('resend.from');
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: 'Código de Verificação',
        html: `<p>Seu código de verificação é: <strong>${code}</strong></p>`,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email de verificação');
    }
  }
}
