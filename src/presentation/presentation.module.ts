import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ApplicationModule } from '@application/application.module';
import { RepositoriesModule } from '@infrastructure/repositories/repositories.module';
import { ServicesModule } from '@infrastructure/services/services.module';
import { AuthController } from './controllers/auth.controller';
import { BillController } from './controllers/bill.controller';
import { JwtStrategy } from './guards/jwt.strategy';
@Module({
  imports: [
    ApplicationModule,
    RepositoriesModule,
    ServicesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController, BillController],
  providers: [JwtStrategy],
})
export class PresentationModule {}
