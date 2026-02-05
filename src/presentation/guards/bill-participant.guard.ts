import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';

@Injectable()
export class BillParticipantGuard implements CanActivate {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const billId = request.params.billId;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new ForbiddenException('Conta não encontrada');
    }

    if (!bill.isParticipant(user.userId)) {
      throw new ForbiddenException('Você não é participante desta conta');
    }

    return true;
  }
}
