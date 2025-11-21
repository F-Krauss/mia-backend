import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PlantsModule } from './plants/plants.module';
import { MachinesModule } from './machines/machines.module';

@Module({
  imports: [PrismaModule, PlantsModule, MachinesModule],
})
export class AppModule {}
