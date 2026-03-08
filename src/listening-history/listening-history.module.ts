import { Module } from '@nestjs/common';
import { ListeningHistoryService } from './listening-history.service';
import { ListeningHistoryController } from './listening-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ListeningHistoryService],
  controllers: [ListeningHistoryController],
  exports: [ListeningHistoryService],
})
export class ListeningHistoryModule {}
