import { Module } from '@nestjs/common';
import { BillGateway } from './gateways/bill.gateway';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';
import { RepositoriesModule } from '@infrastructure/repositories/repositories.module';
import { ServicesModule } from '@infrastructure/services/services.module';
import { BillEventsService } from '@infrastructure/services/bill-events.service';

@Module({
  imports: [RepositoriesModule, ServicesModule],
  providers: [BillGateway, WsJwtAuthGuard, BillEventsService],
  exports: [BillGateway, BillEventsService],
})
export class WebSocketModule {}
