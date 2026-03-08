import { Module } from '@nestjs/common';
import { SingersController } from './singers.controller';
import { SingersService } from './singers.service';

@Module({
  controllers: [SingersController],
  providers: [SingersService],
  exports: [SingersService],
})
export class SingersModule {}
