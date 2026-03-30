import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@infrastructure/repositories/repositories.module';
import { ServicesModule } from '@infrastructure/services/services.module';
import { RegisterUserUseCase } from './use-cases/auth/register-user.use-case';
import { LoginUseCase } from './use-cases/auth/login.use-case';
import { VerifyEmailUseCase } from './use-cases/auth/verify-email.use-case';
import { ResendVerificationCodeUseCase } from './use-cases/auth/resend-verification-code.use-case';
import { CreateBillUseCase } from './use-cases/bills/create-bill.use-case';
import { GetBillUseCase } from './use-cases/bills/get-bill.use-case';
import { GetBillByCodeUseCase } from './use-cases/bills/get-bill-by-code.use-case';
import { ListUserBillsUseCase } from './use-cases/bills/list-user-bills.use-case';
import { AddParticipantToBillUseCase } from './use-cases/bills/add-participant.use-case';
import { RemoveParticipantFromBillUseCase } from './use-cases/bills/remove-participant.use-case';
import { AddItemToBillUseCase } from './use-cases/bills/add-item.use-case';
import { DeleteItemFromBillUseCase } from './use-cases/bills/delete-item.use-case';
import { AddConsumptionUseCase } from './use-cases/bills/add-consumption.use-case';
import { UpdateConsumptionUseCase } from './use-cases/bills/update-consumption.use-case';
import { RemoveConsumptionUseCase } from './use-cases/bills/remove-consumption.use-case';
import { AddBillDetailUseCase } from './use-cases/bills/add-bill-detail.use-case';
import { UpdateBillDetailUseCase } from './use-cases/bills/update-bill-detail.use-case';
import { RemoveBillDetailUseCase } from './use-cases/bills/remove-bill-detail.use-case';
import { DeleteBillUseCase } from './use-cases/bills/delete-bill.use-case';

@Module({
  imports: [RepositoriesModule, ServicesModule],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    ResendVerificationCodeUseCase,
    CreateBillUseCase,
    GetBillUseCase,
    GetBillByCodeUseCase,
    ListUserBillsUseCase,
    AddParticipantToBillUseCase,
    RemoveParticipantFromBillUseCase,
    AddItemToBillUseCase,
    DeleteItemFromBillUseCase,
    AddConsumptionUseCase,
    UpdateConsumptionUseCase,
    RemoveConsumptionUseCase,
    AddBillDetailUseCase,
    UpdateBillDetailUseCase,
    RemoveBillDetailUseCase,
    DeleteBillUseCase,
  ],
  exports: [
    RegisterUserUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    ResendVerificationCodeUseCase,
    CreateBillUseCase,
    GetBillUseCase,
    GetBillByCodeUseCase,
    ListUserBillsUseCase,
    AddParticipantToBillUseCase,
    RemoveParticipantFromBillUseCase,
    AddItemToBillUseCase,
    DeleteItemFromBillUseCase,
    AddConsumptionUseCase,
    UpdateConsumptionUseCase,
    RemoveConsumptionUseCase,
    AddBillDetailUseCase,
    UpdateBillDetailUseCase,
    RemoveBillDetailUseCase,
    DeleteBillUseCase,
  ],
})
export class ApplicationModule {}
