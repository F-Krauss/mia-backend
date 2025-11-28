import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  findAll() {
    return this.proceduresService.findAll();
  }

  @Post()
  create(@Body() dto: CreateProcedureDto) {
    return this.proceduresService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProcedureDto) {
    return this.proceduresService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proceduresService.remove(id);
  }

  @Post(':id/documents')
  addDocuments(
    @Param('id') id: string,
    @Body() body: { documents: CreateProcedureDto['documents'] },
  ) {
    return this.proceduresService.addDocuments(id, body.documents ?? []);
  }

  @Post(':procedureId/documents/:docId/versions')
  addVersion(
    @Param('procedureId') procedureId: string,
    @Param('docId') docId: string,
    @Body()
    body: {
      version: string;
      fileUrl?: string | null;
      fileBase64?: string | null;
      fileName?: string | null;
      uploadDate?: string | Date | null;
      renewalDate?: string | Date | null;
      status?: string;
      updatedBy?: string;
    },
  ) {
    return this.proceduresService.addVersion(procedureId, docId, body);
  }

  @Delete(':procedureId/documents/:docId')
  deleteDocument(
    @Param('procedureId') procedureId: string,
    @Param('docId') docId: string,
  ) {
    return this.proceduresService.deleteDocument(procedureId, docId);
  }

  @Delete(':procedureId/documents/:docId/versions/:versionId')
  deleteVersion(
    @Param('procedureId') procedureId: string,
    @Param('docId') docId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.proceduresService.deleteVersion(
      procedureId,
      docId,
      versionId,
    );
  }
}
