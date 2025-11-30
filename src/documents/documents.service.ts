import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params?: { parentId?: string; parentType?: string; certificationDocument?: string | boolean }) {
    const where = {
      ...this.buildParentWhere(params),
      ...(params?.certificationDocument !== undefined
        ? { certificationDocument: params.certificationDocument === 'true' || params.certificationDocument === true }
        : {}),
    };
    return this.prisma.controlledDocument.findMany({
      where,
      orderBy: [{ code: 'asc' }, { version: 'desc' }],
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.controlledDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  async create(dto: CreateDocumentDto) {
    this.ensureParent(dto);
    const savedUrl = this.maybePersistFile(dto.fileBase64, dto.fileName);
    return this.prisma.controlledDocument.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        version: dto.version,
        status: dto.status,
        nextReview: this.parseDate(dto.nextReview),
        owner: dto.owner ?? null,
        fileUrl: savedUrl ?? dto.fileUrl ?? null,
        fileBase64: savedUrl ? null : dto.fileBase64 ?? null,
        fileName: dto.fileName ?? null,
        plant: dto.plantId ? { connect: { id: dto.plantId } } : undefined,
        process: dto.processId ? { connect: { id: dto.processId } } : undefined,
        subprocess: dto.subprocessId ? { connect: { id: dto.subprocessId } } : undefined,
        machine: dto.machineId ? { connect: { id: dto.machineId } } : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const savedUrl = this.maybePersistFile(dto.fileBase64, dto.fileName);
    return this.prisma.controlledDocument.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        version: dto.version,
        status: dto.status,
        nextReview: dto.nextReview !== undefined ? this.parseDate(dto.nextReview) : undefined,
        owner: dto.owner,
        fileUrl: savedUrl ?? dto.fileUrl,
        fileBase64: savedUrl ? null : dto.fileBase64,
        fileName: dto.fileName,
        plant: dto.plantId ? { connect: { id: dto.plantId } } : dto.plantId === null ? { disconnect: true } : undefined,
        process: dto.processId ? { connect: { id: dto.processId } } : dto.processId === null ? { disconnect: true } : undefined,
        subprocess: dto.subprocessId ? { connect: { id: dto.subprocessId } } : dto.subprocessId === null ? { disconnect: true } : undefined,
        machine: dto.machineId ? { connect: { id: dto.machineId } } : dto.machineId === null ? { disconnect: true } : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.controlledDocument.delete({ where: { id } });
    return { success: true };
  }

  private ensureParent(dto: CreateDocumentDto) {
    if (!dto.plantId && !dto.processId && !dto.subprocessId && !dto.machineId) {
      throw new BadRequestException('Debes asignar plantId, processId, subprocessId o machineId');
    }
  }

  private parseDate(value?: string | Date | null) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private buildParentWhere(params?: { parentId?: string; parentType?: string }): Prisma.ControlledDocumentWhereInput {
    if (!params?.parentId || !params?.parentType) return {};
    switch (params.parentType) {
      case 'plant':
        return { plantId: params.parentId };
      case 'process':
        return { processId: params.parentId };
      case 'subprocess':
        return { subprocessId: params.parentId };
      case 'machine':
        return { machineId: params.parentId };
      default:
        return {};
    }
  }

  private ensureUploadsDir() {
    const dir = join(process.cwd(), 'uploads', 'documents');
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  private maybePersistFile(fileBase64?: string | null, fileName?: string | null): string | null {
    if (!fileBase64 || !fileName) return null;
    try {
      const dir = this.ensureUploadsDir();
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${Date.now()}_${safeName}`;
      const filePath = join(dir, filename);
      const clean = fileBase64.replace(/^data:.*;base64,/, '');
      writeFileSync(filePath, clean, 'base64');
      return `/api/uploads/documents/${filename}`;
    } catch (err) {
      console.error('Error saving document file', err);
      return null;
    }
  }
}
