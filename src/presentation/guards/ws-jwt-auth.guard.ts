import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@infrastructure/services/jwt.service';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    try {
      const token = 
        client.handshake.auth?.token || 
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token as string ||
        null;

      if (!token) {
        throw new WsException('Token não fornecido');
      }

      const payload = await this.jwtService.verify(token);
      
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      this.logger.error(`Authentication failed for socket ${client.id}: ${error.message}`);
      throw new WsException('Token inválido ou expirado');
    }
  }
}
