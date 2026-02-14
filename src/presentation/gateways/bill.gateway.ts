import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, Logger } from '@nestjs/common';
import { WsJwtAuthGuard } from '../guards/ws-jwt-auth.guard';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { ConfigService } from '@nestjs/config';
import { BillResponseDto } from '../dto/bills/bill-response.dto';
import { Bill } from '@domain/entities/bill.entity';
import { JwtService } from '@infrastructure/services/jwt.service';

@WebSocketGateway({
  namespace: 'bills',
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class BillGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BillGateway.name);

  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    const port = this.configService.get<number>('port') || 3000;
    this.logger.log(`WebSocket server is running on namespace: bills`);
    this.logger.log(`WebSocket URL: ws://localhost:${port}/bills`);
    
    if (server.engine) {
      server.engine.on('connection_error', (err: any) => {
        this.logger.error(`Connection error: ${err.message} (code: ${err.code})`);
      });
    }
  }

  async handleConnection(client: Socket) {
    try {
      // Autenticar na conexão
      const token = 
        client.handshake.auth?.token || 
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        client.handshake.query?.token as string ||
        null;

      if (token) {
        try {
          const payload = await this.jwtService.verify(token);
          client.data.user = {
            userId: payload.sub,
            email: payload.email,
          };
          this.logger.log(`Client connected: ${client.id} (User: ${client.data.user.userId})`);
        } catch (error) {
          this.logger.warn(`Client ${client.id} failed authentication: ${error.message}`);
          client.emit('error', { message: 'Token inválido ou expirado' });
          client.disconnect();
          return;
        }
      } else {
        this.logger.warn(`Client ${client.id} connected without token`);
      }
    } catch (error) {
      this.logger.error(`Error handling connection: ${error.message}`, error.stack);
      client.emit('error', { message: 'Erro ao processar conexão' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data?.user;
    this.logger.log(`Client disconnected: ${client.id} (User: ${user?.userId || 'Unknown'})`);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join-bill')
  async handleJoinBill(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { billId: string },
  ) {
    const user = client.data.user;
    const { billId } = data;

    if (!billId) {
      client.emit('error', { message: 'billId é obrigatório' });
      return;
    }

    try {
      const bill = await this.billRepository.findById(billId);

      if (!bill) {
        client.emit('error', { message: 'Conta não encontrada' });
        return;
      }

      if (!bill.isParticipant(user.userId)) {
        client.emit('error', { message: 'Você não é participante desta conta' });
        return;
      }

      const room = `bill:${billId}`;
      await client.join(room);

      this.logger.log(`User ${user.userId} joined room ${room} (Socket: ${client.id})`);

      client.emit('joined-bill', { billId, room });
    } catch (error) {
      this.logger.error(`Error joining bill: ${error.message}`, error.stack);
      client.emit('error', { message: 'Erro ao entrar na conta' });
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leave-bill')
  async handleLeaveBill(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { billId: string },
  ) {
    const user = client.data.user;
    const { billId } = data;

    if (!billId) {
      return;
    }

    const room = `bill:${billId}`;
    await client.leave(room);

    this.logger.log(`User ${user.userId} left room ${room} (Socket: ${client.id})`);

    client.emit('left-bill', { billId });
  }

  /**
   * Emite atualização da conta para todos os participantes conectados
   */
  async emitBillUpdate(billId: string, bill: Bill): Promise<void> {
    const room = `bill:${billId}`;
    
    const socketsInRoom = await this.server.in(room).fetchSockets();
    
    const billResponse: BillResponseDto = {
      id: bill.id,
      code: bill.code,
      adminId: bill.adminId,
      name: bill.name,
      participants: bill.participants.map((p) => ({
        userId: p.userId,
        name: p.name,
        joinedAt: p.joinedAt,
      })),
      items: bill.items.map((i) => ({
        id: i.id,
        name: i.name,
        value: i.value,
        quantity: i.quantity,
        category: i.category,
      })),
      consumptions: bill.consumptions.map((c) => ({
        participantId: c.participantId,
        itemId: c.itemId,
        quantity: c.quantity,
      })),
      details: bill.details?.map((d) => ({
        itemId: d.itemId,
        userId: d.userId,
        quantityConsumed: d.quantityConsumed,
        action: d.action,
      })) || [],
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };

    this.server.to(room).emit('bill-updated', {
      billId,
      bill: billResponse,
      timestamp: new Date(),
    });

    this.logger.log(`Bill update emitted to room ${room} (${socketsInRoom.length} sockets)`);
  }

  /**
   * Emite evento de item adicionado
   */
  emitItemAdded(billId: string, item: any): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('item-added', {
      billId,
      item,
      action: 'added',
      timestamp: new Date(),
    });
    this.logger.debug(`Item added event emitted to room ${room}`);
  }

  /**
   * Emite evento de item removido
   */
  emitItemRemoved(billId: string, itemId: string): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('item-removed', {
      billId,
      itemId,
      action: 'removed',
      timestamp: new Date(),
    });
    this.logger.debug(`Item removed event emitted to room ${room}`);
  }

  /**
   * Emite evento de participante adicionado
   */
  emitParticipantAdded(billId: string, participant: any): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('participant-added', {
      billId,
      participant,
      action: 'added',
      timestamp: new Date(),
    });
    this.logger.debug(`Participant added event emitted to room ${room}`);
  }

  /**
   * Emite evento de participante removido
   */
  emitParticipantRemoved(billId: string, participantId: string): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('participant-removed', {
      billId,
      participantId,
      action: 'removed',
      timestamp: new Date(),
    });
    this.logger.debug(`Participant removed event emitted to room ${room}`);
  }

  /**
   * Emite evento de consumo adicionado
   */
  emitConsumptionAdded(billId: string, consumption: any): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('consumption-added', {
      billId,
      consumption,
      action: 'added',
      timestamp: new Date(),
    });
    this.logger.debug(`Consumption added event emitted to room ${room}`);
  }

  /**
   * Emite evento de consumo atualizado
   */
  emitConsumptionUpdated(billId: string, consumption: any): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('consumption-updated', {
      billId,
      consumption,
      action: 'updated',
      timestamp: new Date(),
    });
    this.logger.debug(`Consumption updated event emitted to room ${room}`);
  }

  /**
   * Emite evento de consumo removido
   */
  emitConsumptionRemoved(billId: string, participantId: string, itemId: string): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('consumption-removed', {
      billId,
      participantId,
      itemId,
      action: 'removed',
      timestamp: new Date(),
    });
    this.logger.debug(`Consumption removed event emitted to room ${room}`);
  }

  /**
   * Emite evento de detail adicionado
   */
  emitBillDetailAdded(billId: string, detail: any): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('bill-detail-added', {
      billId,
      detail,
      action: 'added',
      timestamp: new Date(),
    });
    this.logger.debug(`Bill detail added event emitted to room ${room}`);
  }

  /**
   * Emite evento de detail atualizado
   */
  emitBillDetailUpdated(billId: string, detail: any): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('bill-detail-updated', {
      billId,
      detail,
      action: 'updated',
      timestamp: new Date(),
    });
    this.logger.debug(`Bill detail updated event emitted to room ${room}`);
  }

  /**
   * Emite evento de detail removido
   */
  emitBillDetailRemoved(billId: string, userId: string, itemId: string): void {
    const room = `bill:${billId}`;
    this.server.to(room).emit('bill-detail-removed', {
      billId,
      userId,
      itemId,
      action: 'removed',
      timestamp: new Date(),
    });
    this.logger.debug(`Bill detail removed event emitted to room ${room}`);
  }
}
