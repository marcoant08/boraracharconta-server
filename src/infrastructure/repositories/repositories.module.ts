import { Module } from '@nestjs/common';
import { MongoDBModule } from '../database/mongodb.module';
import { UserRepository } from './user.repository';
import { BillRepository } from './bill.repository';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';

@Module({
  imports: [MongoDBModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IBillRepository',
      useClass: BillRepository,
    },
  ],
  exports: ['IUserRepository', 'IBillRepository'],
})
export class RepositoriesModule {}
