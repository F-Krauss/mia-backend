import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CertificationDocumentsService } from './certification-documents.service';
import { CreateCertificationDocumentDto } from './dto/create-certification-document.dto';
import { UpdateCertificationDocumentDto } from './dto/update-certification-document.dto';

@Controller('certification-documents')
export class CertificationDocumentsController {
  constructor(
    private readonly certificationDocumentsService: CertificationDocumentsService,
  ) {}

  @Get()
  findAll() {
    return this.certificationDocumentsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateCertificationDocumentDto) {
    return this.certificationDocumentsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCertificationDocumentDto,
  ) {
    return this.certificationDocumentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificationDocumentsService.remove(id);
  }
}
