import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { IBillRepository } from '@domain/repositories/bill.repository.interface';

@Injectable()
export class CanManageParticipantsGuard implements CanActivate {
  constructor(
    @Inject('IBillRepository')
    private readonly billRepository: IBillRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const billId = request.params.billId;
    const participantId = request.params.participantId || request.body?.participantId;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const bill = await this.billRepository.findById(billId);

    if (!bill) {
      throw new ForbiddenException('Conta não encontrada');
    }

    // Se for admin, pode gerenciar qualquer participante
    if (bill.isAdmin(user.userId)) {
      return true;
    }

    // Se não for admin, só pode gerenciar visitantes
    if (participantId) {
      const participant = bill.participants.find(
        (p) => p.userId === participantId || p.name === participantId,
      );

      if (participant && !participant.isVisitor) {
        throw new ForbiddenException(
          'Você só pode remover participantes visitantes',
        );
      }
    }

    return true;
  }
}
