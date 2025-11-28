import { Module } from '@nestjs/common';
import { CertificationDocumentsService } from './certification-documents.service';
import { CertificationDocumentsController } from './certification-documents.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CertificationDocumentsController],
  providers: [CertificationDocumentsService],
})
export class CertificationDocumentsModule {}
