import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { PlantsModule } from './plants/plants.module';
import { MachinesModule } from './machines/machines.module';
import { WorkOrdersModule } from './workOrders/workOrders.module';
import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase/firebase-auth.guard';
import { CertificationDocumentsModule } from './certification-documents/certification-documents.module';
import { ProceduresModule } from './procedures/procedures.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    PlantsModule,
    MachinesModule,
    WorkOrdersModule,
    FirebaseModule,
    CertificationDocumentsModule,
    ProceduresModule,
    DocumentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
