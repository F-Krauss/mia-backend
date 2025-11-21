// src/machines/machines.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMachineDto } from './dto/create-machines.dto';
import { UploadMachineDocsDto } from './dto/upload-docs.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMachineDto) {
    const { processId, subprocessId, ...rest } = dto;

    return this.prisma.machine.create({
      data: {
        ...rest,
        process: processId ? { connect: { id: processId } } : undefined,
        subprocess: subprocessId ? { connect: { id: subprocessId } } : undefined,
      },
      include: {
        documents: true,
      },
    });
  }

  async uploadDocuments(
    machineId: string,
    docs: UploadMachineDocsDto['documents'],
  ) {
    // validar que exista la máquina
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    // si no mandas docs, simplemente regresa la máquina con docs
    if (!docs || docs.length === 0) {
      return this.prisma.machine.findUnique({
        where: { id: machineId },
        include: { documents: true },
      });
    }

    // crear registros de documentos
    await this.prisma.machineDocument.createMany({
      data: docs.map((d) => ({
        name: d.name,
        mimeType: d.mimeType,
        base64Data: d.base64Data,
        machineId,
      })),
    });

    // devolver la máquina con sus documentos actualizados
    return this.prisma.machine.findUnique({
      where: { id: machineId },
      include: { documents: true },
    });
  }

  async remove(id: string) {
    // borra documentos y luego máquina
    await this.prisma.machineDocument.deleteMany({
      where: { machineId: id },
    });

    return this.prisma.machine.delete({
      where: { id },
    });
  }

  async removeDocument(machineId: string, docId: string) {
    // opcional: podrías validar que el doc pertenezca a esa máquina
    return this.prisma.machineDocument.delete({
      where: { id: docId },
    });
  }
}
