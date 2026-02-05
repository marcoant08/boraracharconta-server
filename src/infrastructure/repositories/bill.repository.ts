import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bill } from '@domain/entities/bill.entity';
import { BillItem } from '@domain/entities/bill-item.entity';
import { Consumption } from '@domain/entities/consumption.entity';
import { Participant } from '@domain/value-objects/participant.vo';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';
import { Bill as BillDocument, BillDocument as BillDoc } from '../database/schemas/bill.schema';

@Injectable()
export class BillRepository implements IBillRepository {
  constructor(
    @InjectModel(Bill.name) private billModel: Model<BillDoc>,
  ) {}

  async create(bill: Bill): Promise<Bill> {
    const createdBill = new this.billModel({
      code: bill.code,
      adminId: bill.adminId,
      name: bill.name,
      participants: bill.participants.map(p => ({
        userId: p.userId,
        name: p.name,
        joinedAt: p.joinedAt,
      })),
      items: bill.items.map(i => ({
        id: i.id,
        name: i.name,
        value: i.value,
        quantity: i.quantity,
        category: i.category,
      })),
      consumptions: bill.consumptions.map(c => ({
        participantId: c.participantId,
        itemId: c.itemId,
        quantity: c.quantity,
      })),
    });
    const saved = await createdBill.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Bill | null> {
    const bill = await this.billModel.findById(id).exec();
    return bill ? this.toDomain(bill) : null;
  }

  async findByCode(code: string): Promise<Bill | null> {
    const bill = await this.billModel.findOne({ code }).exec();
    return bill ? this.toDomain(bill) : null;
  }

  async update(bill: Bill): Promise<Bill> {
    const updated = await this.billModel
      .findByIdAndUpdate(
        bill.id,
        {
          code: bill.code,
          adminId: bill.adminId,
          name: bill.name,
          participants: bill.participants,
          items: bill.items,
          consumptions: bill.consumptions,
        },
        { new: true },
      )
      .exec();
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.billModel.findByIdAndDelete(id).exec();
  }

  async addItem(billId: string, item: BillItem): Promise<void> {
    await this.billModel.findByIdAndUpdate(billId, {
      $push: {
        items: {
          id: item.id,
          name: item.name,
          value: item.value,
          quantity: item.quantity,
          category: item.category,
        },
      },
    }).exec();
  }

  async removeItem(billId: string, itemId: string): Promise<void> {
    // Remover item
    await this.billModel.findByIdAndUpdate(billId, {
      $pull: { items: { id: itemId } },
    }).exec();

    // Remover consumptions relacionados
    await this.billModel.findByIdAndUpdate(billId, {
      $pull: { consumptions: { itemId } },
    }).exec();
  }

  async addConsumption(billId: string, consumption: Consumption): Promise<void> {
    await this.billModel.findByIdAndUpdate(billId, {
      $push: {
        consumptions: {
          participantId: consumption.participantId,
          itemId: consumption.itemId,
          quantity: consumption.quantity ?? 1,
        },
      },
    }).exec();
  }

  async updateConsumption(
    billId: string,
    participantId: string,
    itemId: string,
    quantity: number,
  ): Promise<void> {
    await this.billModel.findByIdAndUpdate(
      billId,
      {
        $set: {
          'consumptions.$[cons].quantity': quantity,
        },
      },
      {
        arrayFilters: [
          { 'cons.participantId': participantId, 'cons.itemId': itemId },
        ],
      },
    ).exec();
  }

  async removeConsumption(
    billId: string,
    participantId: string,
    itemId: string,
  ): Promise<void> {
    await this.billModel.findByIdAndUpdate(billId, {
      $pull: {
        consumptions: {
          participantId,
          itemId,
        },
      },
    }).exec();
  }

  async addParticipant(billId: string, participant: Participant): Promise<void> {
    await this.billModel.findByIdAndUpdate(billId, {
      $push: {
        participants: {
          userId: participant.userId,
          name: participant.name,
          joinedAt: participant.joinedAt,
        },
      },
    }).exec();
  }

  async removeParticipant(billId: string, participantId: string): Promise<void> {
    // Buscar bill para identificar o participante
    const bill = await this.billModel.findById(billId).exec();
    if (!bill) return;

    const participant = bill.participants.find(
      (p) => p.userId === participantId || p.name === participantId,
    );

    if (!participant) return;

    const identifier = participant.userId || participant.name;

    // Remover participante
    await this.billModel.findByIdAndUpdate(billId, {
      $pull: {
        participants: participant.userId
          ? { userId: participant.userId }
          : { name: participant.name },
      },
    }).exec();

    // Remover consumptions relacionados
    await this.billModel.findByIdAndUpdate(billId, {
      $pull: {
        consumptions: { participantId: identifier },
      },
    }).exec();
  }

  private toDomain(bill: BillDoc): Bill {
    return new Bill(
      bill._id.toString(),
      bill.code,
      bill.adminId,
      bill.name,
      bill.participants.map(p => new Participant(p.userId, p.name, p.joinedAt)),
      bill.items.map(i => new BillItem(i.id, i.name, i.value, i.quantity, i.category)),
      bill.consumptions.map(c => new Consumption(c.participantId, c.itemId, c.quantity)),
      (bill as any).createdAt || new Date(),
      (bill as any).updatedAt || new Date(),
    );
  }
}
