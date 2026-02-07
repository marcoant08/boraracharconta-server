import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BillParticipantGuard } from '../guards/bill-participant.guard';
import { CanManageItemsGuard } from '../guards/can-manage-items.guard';
import { CanManageParticipantsGuard } from '../guards/can-manage-participants.guard';
import { CreateBillUseCase } from '@application/use-cases/bills/create-bill.use-case';
import { JoinBillByCodeUseCase } from '@application/use-cases/bills/join-bill.use-case';
import { GetBillUseCase } from '@application/use-cases/bills/get-bill.use-case';
import { ListUserBillsUseCase } from '@application/use-cases/bills/list-user-bills.use-case';
import { AddParticipantToBillUseCase } from '@application/use-cases/bills/add-participant.use-case';
import { RemoveParticipantFromBillUseCase } from '@application/use-cases/bills/remove-participant.use-case';
import { AddItemToBillUseCase } from '@application/use-cases/bills/add-item.use-case';
import { DeleteItemFromBillUseCase } from '@application/use-cases/bills/delete-item.use-case';
import { AddConsumptionUseCase } from '@application/use-cases/bills/add-consumption.use-case';
import { UpdateConsumptionUseCase } from '@application/use-cases/bills/update-consumption.use-case';
import { RemoveConsumptionUseCase } from '@application/use-cases/bills/remove-consumption.use-case';
import { CreateBillDto } from '../dto/bills/create-bill.dto';
import { JoinBillDto } from '../dto/bills/join-bill.dto';
import { AddParticipantDto } from '../dto/bills/add-participant.dto';
import { AddItemDto } from '../dto/bills/add-item.dto';
import { AddConsumptionDto } from '../dto/bills/add-consumption.dto';
import { UpdateConsumptionDto } from '../dto/bills/update-consumption.dto';
import { RemoveConsumptionDto } from '../dto/bills/remove-consumption.dto';
import { BillResponseDto } from '../dto/bills/bill-response.dto';
import { BillSummaryDto } from '../dto/bills/bill-summary.dto';
import { Bill } from '@domain/entities/bill.entity';

@ApiTags('bills')
@Controller('bills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillController {
  constructor(
    private readonly createBillUseCase: CreateBillUseCase,
    private readonly joinBillByCodeUseCase: JoinBillByCodeUseCase,
    private readonly getBillUseCase: GetBillUseCase,
    private readonly listUserBillsUseCase: ListUserBillsUseCase,
    private readonly addParticipantToBillUseCase: AddParticipantToBillUseCase,
    private readonly removeParticipantFromBillUseCase: RemoveParticipantFromBillUseCase,
    private readonly addItemToBillUseCase: AddItemToBillUseCase,
    private readonly deleteItemFromBillUseCase: DeleteItemFromBillUseCase,
    private readonly addConsumptionUseCase: AddConsumptionUseCase,
    private readonly updateConsumptionUseCase: UpdateConsumptionUseCase,
    private readonly removeConsumptionUseCase: RemoveConsumptionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso', type: BillResponseDto })
  async createBill(@Body() createBillDto: CreateBillDto, @Request() req) {
    const bill = await this.createBillUseCase.execute(
      req.user.userId,
      createBillDto.name,
    );
    return this.mapToResponse(bill);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Entrar na conta via código' })
  @ApiResponse({ status: 200, description: 'Entrou na conta com sucesso' })
  async joinBill(@Body() joinBillDto: JoinBillDto, @Request() req) {
    const billId = await this.joinBillByCodeUseCase.execute(joinBillDto.code, req.user.userId);
    return { billId, message: 'Entrou na conta com sucesso' };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de contas', type: [BillSummaryDto] })
  async listUserBills(@Request() req) {
    const bills = await this.listUserBillsUseCase.execute(req.user.userId);
    return bills.map(bill => ({
      id: bill.id,
      code: bill.code,
      name: bill.name,
    }));
  }

  @Get(':billId')
  @ApiOperation({ summary: 'Obter detalhes da conta' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 200, description: 'Conta encontrada', type: BillResponseDto })
  @UseGuards(BillParticipantGuard)
  async getBill(@Param('billId') billId: string) {
    const bill = await this.getBillUseCase.execute(billId);
    return this.mapToResponse(bill);
  }

  @Post(':billId/items')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BillParticipantGuard, CanManageItemsGuard)
  @ApiOperation({ summary: 'Adicionar item à conta' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 201, description: 'Item adicionado com sucesso' })
  async addItem(
    @Param('billId') billId: string,
    @Body() addItemDto: AddItemDto,
    @Request() req,
  ) {
    const item = await this.addItemToBillUseCase.execute(
      billId,
      addItemDto.name,
      addItemDto.value,
      addItemDto.quantity,
      addItemDto.category,
    );
    return item;
  }

  @Delete(':billId/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BillParticipantGuard, CanManageItemsGuard)
  @ApiOperation({ summary: 'Remover item da conta' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiParam({ name: 'itemId', description: 'ID do item' })
  @ApiResponse({ status: 204, description: 'Item removido com sucesso' })
  async deleteItem(
    @Param('billId') billId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.deleteItemFromBillUseCase.execute(billId, itemId);
  }

  @Post(':billId/consumptions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BillParticipantGuard, CanManageItemsGuard)
  @ApiOperation({ summary: 'Adicionar consumo de item por participante' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 201, description: 'Consumo adicionado com sucesso' })
  async addConsumption(
    @Param('billId') billId: string,
    @Body() addConsumptionDto: AddConsumptionDto,
  ) {
    await this.addConsumptionUseCase.execute(
      billId,
      addConsumptionDto.participantId,
      addConsumptionDto.itemId,
      addConsumptionDto.quantity,
    );
    return { message: 'Consumo adicionado com sucesso' };
  }

  @Put(':billId/consumptions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BillParticipantGuard, CanManageItemsGuard)
  @ApiOperation({ summary: 'Atualizar quantidade consumida' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 200, description: 'Consumo atualizado com sucesso' })
  async updateConsumption(
    @Param('billId') billId: string,
    @Body() updateConsumptionDto: UpdateConsumptionDto,
  ) {
    await this.updateConsumptionUseCase.execute(
      billId,
      updateConsumptionDto.participantId,
      updateConsumptionDto.itemId,
      updateConsumptionDto.quantity,
    );
    return { message: 'Consumo atualizado com sucesso' };
  }

  @Delete(':billId/consumptions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BillParticipantGuard, CanManageItemsGuard)
  @ApiOperation({ summary: 'Remover consumo' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 204, description: 'Consumo removido com sucesso' })
  async removeConsumption(
    @Param('billId') billId: string,
    @Body() removeConsumptionDto: RemoveConsumptionDto,
  ) {
    await this.removeConsumptionUseCase.execute(
      billId,
      removeConsumptionDto.participantId,
      removeConsumptionDto.itemId,
    );
  }

  @Post(':billId/participants')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BillParticipantGuard, CanManageParticipantsGuard)
  @ApiOperation({ summary: 'Adicionar participante visitante' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 201, description: 'Participante adicionado com sucesso' })
  async addParticipant(
    @Param('billId') billId: string,
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    await this.addParticipantToBillUseCase.execute(billId, addParticipantDto.name);
    return { message: 'Participante adicionado com sucesso' };
  }

  @Delete(':billId/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BillParticipantGuard, CanManageParticipantsGuard)
  @ApiOperation({ summary: 'Remover participante' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiParam({ name: 'participantId', description: 'ID ou nome do participante' })
  @ApiResponse({ status: 204, description: 'Participante removido com sucesso' })
  async removeParticipant(
    @Param('billId') billId: string,
    @Param('participantId') participantId: string,
    @Request() req,
  ) {
    await this.removeParticipantFromBillUseCase.execute(
      billId,
      participantId,
      req.user.userId,
    );
  }

  private mapToResponse(bill: Bill): BillResponseDto {
    return {
      id: bill.id,
      code: bill.code,
      adminId: bill.adminId,
      name: bill.name,
      participants: bill.participants,
      items: bill.items,
      consumptions: bill.consumptions,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };
  }
}
