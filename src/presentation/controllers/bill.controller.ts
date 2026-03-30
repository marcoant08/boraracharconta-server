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
import { BillAdminGuard } from '../guards/bill-admin.guard';
import { CreateBillUseCase } from '@application/use-cases/bills/create-bill.use-case';
import { GetBillUseCase } from '@application/use-cases/bills/get-bill.use-case';
import { GetBillByCodeUseCase } from '@application/use-cases/bills/get-bill-by-code.use-case';
import { ListUserBillsUseCase } from '@application/use-cases/bills/list-user-bills.use-case';
import { AddParticipantToBillUseCase } from '@application/use-cases/bills/add-participant.use-case';
import { RemoveParticipantFromBillUseCase } from '@application/use-cases/bills/remove-participant.use-case';
import { AddItemToBillUseCase } from '@application/use-cases/bills/add-item.use-case';
import { DeleteItemFromBillUseCase } from '@application/use-cases/bills/delete-item.use-case';
import { AddConsumptionUseCase } from '@application/use-cases/bills/add-consumption.use-case';
import { UpdateConsumptionUseCase } from '@application/use-cases/bills/update-consumption.use-case';
import { RemoveConsumptionUseCase } from '@application/use-cases/bills/remove-consumption.use-case';
import { AddBillDetailUseCase } from '@application/use-cases/bills/add-bill-detail.use-case';
import { UpdateBillDetailUseCase } from '@application/use-cases/bills/update-bill-detail.use-case';
import { RemoveBillDetailUseCase } from '@application/use-cases/bills/remove-bill-detail.use-case';
import { DeleteBillUseCase } from '@application/use-cases/bills/delete-bill.use-case';
import { CreateBillDto } from '../dto/bills/create-bill.dto';
import { AddParticipantDto } from '../dto/bills/add-participant.dto';
import { AddItemDto } from '../dto/bills/add-item.dto';
import { AddConsumptionDto } from '../dto/bills/add-consumption.dto';
import { UpdateConsumptionDto } from '../dto/bills/update-consumption.dto';
import { RemoveConsumptionDto } from '../dto/bills/remove-consumption.dto';
import { AddBillDetailDto } from '../dto/bills/add-bill-detail.dto';
import { UpdateBillDetailDto } from '../dto/bills/update-bill-detail.dto';
import { RemoveBillDetailDto } from '../dto/bills/remove-bill-detail.dto';
import { BillResponseDto } from '../dto/bills/bill-response.dto';
import { BillSummaryDto } from '../dto/bills/bill-summary.dto';
import { Bill } from '@domain/entities/bill.entity';

@ApiTags('bills')
@Controller('bills')
export class BillController {
  constructor(
    private readonly createBillUseCase: CreateBillUseCase,
    private readonly getBillUseCase: GetBillUseCase,
    private readonly getBillByCodeUseCase: GetBillByCodeUseCase,
    private readonly listUserBillsUseCase: ListUserBillsUseCase,
    private readonly addParticipantToBillUseCase: AddParticipantToBillUseCase,
    private readonly removeParticipantFromBillUseCase: RemoveParticipantFromBillUseCase,
    private readonly addItemToBillUseCase: AddItemToBillUseCase,
    private readonly deleteItemFromBillUseCase: DeleteItemFromBillUseCase,
    private readonly addConsumptionUseCase: AddConsumptionUseCase,
    private readonly updateConsumptionUseCase: UpdateConsumptionUseCase,
    private readonly removeConsumptionUseCase: RemoveConsumptionUseCase,
    private readonly addBillDetailUseCase: AddBillDetailUseCase,
    private readonly updateBillDetailUseCase: UpdateBillDetailUseCase,
    private readonly removeBillDetailUseCase: RemoveBillDetailUseCase,
    private readonly deleteBillUseCase: DeleteBillUseCase,
  ) {}

  @Get('code/:code')
  @ApiOperation({ summary: 'Visualizar conta pública pelo código (sem autenticação)' })
  @ApiParam({ name: 'code', description: 'Código da conta' })
  @ApiResponse({ status: 200, description: 'Conta encontrada', type: BillResponseDto })
  @ApiResponse({ status: 403, description: 'Conta privada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async getBillByCode(@Param('code') code: string) {
    const bill = await this.getBillByCodeUseCase.execute(code);
    return this.mapToResponse(bill);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso', type: BillResponseDto })
  async createBill(@Body() createBillDto: CreateBillDto, @Request() req) {
    const bill = await this.createBillUseCase.execute(
      req.user.userId,
      createBillDto.name,
      createBillDto.isPublic,
    );
    return this.mapToResponse(bill);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as contas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de contas', type: [BillSummaryDto] })
  async listUserBills(@Request() req) {
    const bills = await this.listUserBillsUseCase.execute(req.user.userId);
    return bills.map(bill => ({
      id: bill.id,
      code: bill.code,
      name: bill.name,
      isPublic: bill.isPublic,
    }));
  }

  @Get(':billId')
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter detalhes da conta (apenas admin)' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 200, description: 'Conta encontrada', type: BillResponseDto })
  async getBill(@Param('billId') billId: string) {
    const bill = await this.getBillUseCase.execute(billId);
    return this.mapToResponse(bill);
  }

  @Delete(':billId')
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar conta (apenas admin)' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 204, description: 'Conta deletada com sucesso' })
  async deleteBill(@Param('billId') billId: string) {
    await this.deleteBillUseCase.execute(billId);
  }

  @Post(':billId/items')
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar item à conta' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 201, description: 'Item adicionado com sucesso' })
  async addItem(
    @Param('billId') billId: string,
    @Body() addItemDto: AddItemDto,
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
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
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
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
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
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
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
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
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

  @Post(':billId/details')
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar evento na linha do tempo (join/left)' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 201, description: 'Detail adicionado com sucesso' })
  async addBillDetail(
    @Param('billId') billId: string,
    @Body() addBillDetailDto: AddBillDetailDto,
  ) {
    await this.addBillDetailUseCase.execute(
      billId,
      addBillDetailDto.itemId,
      addBillDetailDto.userId,
      addBillDetailDto.quantityConsumed,
      addBillDetailDto.action,
    );
    return { message: 'Detail adicionado com sucesso' };
  }

  @Put(':billId/details')
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar evento na linha do tempo' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 200, description: 'Detail atualizado com sucesso' })
  async updateBillDetail(
    @Param('billId') billId: string,
    @Body() updateBillDetailDto: UpdateBillDetailDto,
  ) {
    await this.updateBillDetailUseCase.execute(
      billId,
      updateBillDetailDto.itemId,
      updateBillDetailDto.userId,
      updateBillDetailDto.quantityConsumed,
      updateBillDetailDto.action,
    );
    return { message: 'Detail atualizado com sucesso' };
  }

  @Delete(':billId/details')
  @UseGuards(JwtAuthGuard, BillAdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover detail de consumo durante ausência' })
  @ApiParam({ name: 'billId', description: 'ID da conta' })
  @ApiResponse({ status: 204, description: 'Detail removido com sucesso' })
  async removeBillDetail(
    @Param('billId') billId: string,
    @Body() removeBillDetailDto: RemoveBillDetailDto,
  ) {
    await this.removeBillDetailUseCase.execute(
      billId,
      removeBillDetailDto.userId,
      removeBillDetailDto.itemId,
    );
  }

  private mapToResponse(bill: Bill): BillResponseDto {
    return {
      id: bill.id,
      code: bill.code,
      adminId: bill.adminId,
      name: bill.name,
      isPublic: bill.isPublic,
      participants: bill.participants,
      items: bill.items,
      consumptions: bill.consumptions,
      details: bill.details || [],
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };
  }
}
