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
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(
    @Query('parentId') parentId?: string,
    @Query('parentType') parentType?: string,
    @Query('certificationDocument') certificationDocument?: string,
  ) {
    return this.documentsService.findAll({ parentId, parentType, certificationDocument });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateDocumentDto) {
    try {
      console.log('[DocumentsController] Creating document:', {
        code: dto.code,
        name: dto.name,
        plantId: dto.plantId,
        processId: dto.processId,
        hasFile: !!dto.fileBase64,
      });
      const result = await this.documentsService.create(dto);
      console.log('[DocumentsController] Created document id:', result.id);
      return result;
    } catch (error: any) {
      console.error('[DocumentsController] Error creating document:', error?.message || error);
      if (error?.code === 'P2025') {
        throw new HttpException(
          `No se encontró el registro padre (planta/proceso/máquina). Verifica que exista.`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (error?.code === 'P2002') {
        throw new HttpException(
          `Ya existe un documento con ese código y versión.`,
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
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
