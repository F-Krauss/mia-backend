import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, Procedure } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.procedure.findMany({
      include: {
        documents: {
          include: { versions: true },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async create(dto: CreateProcedureDto): Promise<Procedure> {
    this.ensureParent(dto);

    return this.prisma.procedure.create({
      data: this.mapCreate(dto),
      include: {
        documents: {
          include: { versions: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProcedureDto) {
    await this.ensureExists(id);
    return this.prisma.procedure.update({
      where: { id },
      data: this.mapUpdate(dto),
      include: {
        documents: {
          include: { versions: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.procedure.delete({ where: { id } });
    return { success: true };
  }

  async addDocuments(
    procedureId: string,
    docs: CreateProcedureDto['documents'] = [],
  ) {
    await this.ensureExists(procedureId);
    const formattedDocs = docs.map((doc) => ({
      code: doc.code,
      name: doc.name,
      versions: {
        create: (doc.versions ?? []).map((ver) => ({
          version: ver.version,
          fileUrl: ver.fileUrl ?? ver.fileBase64 ?? null,
          fileBase64: ver.fileBase64 ?? null,
          fileName: ver.fileName ?? null,
          uploadDate: ver.uploadDate ? new Date(ver.uploadDate) : undefined,
          renewalDate: ver.renewalDate ? new Date(ver.renewalDate) : undefined,
          status: ver.status ?? 'in_review',
          updatedBy: ver.updatedBy ?? null,
        })),
      },
    }));

    await this.prisma.procedure.update({
      where: { id: procedureId },
      data: {
        documents: { create: formattedDocs },
      },
    });

    return this.findOne(procedureId);
  }

  async addVersion(
    procedureId: string,
    documentId: string,
    version: {
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
    await this.ensureDocExists(procedureId, documentId);
    await this.prisma.procedureDocumentVersion.create({
      data: {
        version: version.version,
        fileUrl: version.fileUrl ?? version.fileBase64 ?? null,
        fileBase64: version.fileBase64 ?? null,
        fileName: version.fileName ?? null,
        uploadDate: version.uploadDate ? new Date(version.uploadDate) : undefined,
        renewalDate: version.renewalDate ? new Date(version.renewalDate) : undefined,
        status: version.status ?? 'in_review',
        updatedBy: version.updatedBy ?? null,
        document: { connect: { id: documentId } },
      },
    });
    return this.findOne(procedureId);
  }

  async deleteDocument(procedureId: string, documentId: string) {
    await this.ensureDocExists(procedureId, documentId);
    await this.prisma.procedureDocument.delete({ where: { id: documentId } });
    return this.findOne(procedureId);
  }

  async deleteVersion(
    procedureId: string,
    documentId: string,
    versionId: string,
  ) {
    await this.ensureDocExists(procedureId, documentId);
    await this.prisma.procedureDocumentVersion.delete({
      where: { id: versionId },
    });
    return this.findOne(procedureId);
  }

  findOne(id: string) {
    return this.prisma.procedure.findUnique({
      where: { id },
      include: {
        documents: {
          include: { versions: true },
        },
      },
    });
  }

  private ensureParent(dto: CreateProcedureDto) {
    if (!dto.processId && !dto.subprocessId) {
      throw new BadRequestException(
        'Debes enviar processId o subprocessId para crear un procedimiento',
      );
    }
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.procedure.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('Procedimiento no encontrado');
  }

  private async ensureDocExists(procedureId: string, documentId: string) {
    const doc = await this.prisma.procedureDocument.findFirst({
      where: { id: documentId, procedureId },
      select: { id: true },
    });
    if (!doc) {
      throw new NotFoundException('Documento no encontrado para este procedimiento');
    }
  }

  private mapCreate(dto: CreateProcedureDto): Prisma.ProcedureCreateInput {
    return {
      title: dto.title,
      description: dto.description ?? null,
      reviewer: dto.reviewer ?? null,
      responsible: dto.responsible ?? null,
      notifyEmail: dto.notifyEmail ?? false,
      notifyWhatsapp: dto.notifyWhatsapp ?? false,
      status: dto.status ?? 'active',
      process: dto.processId
        ? { connect: { id: dto.processId } }
        : undefined,
      subprocess: dto.subprocessId
        ? { connect: { id: dto.subprocessId } }
        : undefined,
      documents: dto.documents
        ? {
            create: dto.documents.map((doc) => ({
              code: doc.code,
              name: doc.name,
              versions: {
                create: (doc.versions ?? []).map((ver) => ({
                  version: ver.version,
                  fileUrl: ver.fileUrl ?? ver.fileBase64 ?? null,
                  fileBase64: ver.fileBase64 ?? null,
                  fileName: ver.fileName ?? null,
                  uploadDate: ver.uploadDate
                    ? new Date(ver.uploadDate)
                    : undefined,
                  renewalDate: ver.renewalDate
                    ? new Date(ver.renewalDate)
                    : undefined,
                  status: ver.status ?? 'in_review',
                  updatedBy: ver.updatedBy ?? null,
                })),
              },
            })),
          }
        : undefined,
    };
  }

  private mapUpdate(dto: UpdateProcedureDto): Prisma.ProcedureUpdateInput {
    const data: Prisma.ProcedureUpdateInput = {
      title: dto.title,
      description: dto.description ?? null,
      reviewer: dto.reviewer ?? null,
      responsible: dto.responsible ?? null,
      notifyEmail: dto.notifyEmail,
      notifyWhatsapp: dto.notifyWhatsapp,
      status: dto.status,
    };

    if (dto.processId) {
      data.process = { connect: { id: dto.processId } };
      data.subprocess = { disconnect: true };
    }
    if (dto.subprocessId) {
      data.subprocess = { connect: { id: dto.subprocessId } };
      data.process = { disconnect: true };
    }

    return data;
  }
}
