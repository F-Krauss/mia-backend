import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkOrdersService } from './workOrders.service';
import { WorkOrdersController } from './workOrders.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
})
export class WorkOrdersModule {}
