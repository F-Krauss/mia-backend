import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
  async create(@Body() dto: CreateCertificationDocumentDto) {
    try {
      return await this.certificationDocumentsService.create(dto);
    } catch (error: any) {
      // Surface meaningful error messages to the client
      if (error?.code === 'P2002') {
        throw new HttpException(
          `Ya existe un documento con código "${dto.code}" y versión "${dto.version}".`,
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        error?.message || 'Error al crear documento',
        HttpStatus.BAD_REQUEST,
      );
    }
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
