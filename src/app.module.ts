import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { PlantsModule } from './plants/plants.module';
import { MachinesModule } from './machines/machines.module';
import { WorkOrdersModule } from './workOrders/workOrders.module';
import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';

@Module({
  imports: [PrismaModule, PlantsModule, MachinesModule, WorkOrdersModule, FirebaseModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
