// src/machines/machines.controller.ts
import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machines.dto';
import { UploadMachineDocsDto } from './dto/upload-docs.dto';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  create(@Body() dto: CreateMachineDto) {
    return this.machinesService.create(dto);
  }

  @Post(':id/documents')
  uploadDocuments(
    @Param('id') id: string,
    @Body() dto: UploadMachineDocsDto,
  ) {
    // el DTO tiene { documents: [...] }
    return this.machinesService.uploadDocuments(id, dto.documents);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.machinesService.remove(id);
  }

  @Delete(':machineId/documents/:docId')
  removeDocument(
    @Param('machineId') machineId: string,
    @Param('docId') docId: string,
  ) {
    return this.machinesService.removeDocument(machineId, docId);
  }
}
