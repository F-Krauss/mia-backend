import { Module } from '@nestjs/common';
import { AiQueriesController } from './ai-queries.controller';
import { AiQueriesService } from './ai-queries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiQueriesController],
  providers: [AiQueriesService],
  exports: [AiQueriesService],
})
export class AiQueriesModule {}
