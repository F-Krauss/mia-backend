import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, Procedure } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class ProceduresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

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

    const normalizedDocs = await this.normalizeDocumentsWithControlled(
      dto.documents ?? [],
      { processId: dto.processId ?? null, subprocessId: dto.subprocessId ?? null },
    );

    const data: Prisma.ProcedureCreateInput = {
      title: dto.title,
      description: dto.description ?? null,
      reviewer: dto.reviewer ?? null,
      responsible: dto.responsible ?? null,
      notifyEmail: dto.notifyEmail ?? false,
      notifyWhatsapp: dto.notifyWhatsapp ?? false,
      status: dto.status ?? 'active',
      process: dto.processId ? { connect: { id: dto.processId } } : undefined,
      subprocess: dto.subprocessId ? { connect: { id: dto.subprocessId } } : undefined,
      documents: normalizedDocs.length
        ? {
            create: normalizedDocs.map((doc) => ({
              code: doc.code,
              name: doc.name,
              versions: { create: doc.versions },
            })),
          }
        : undefined,
    };

    return this.prisma.procedure.create({
      data,
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
    const parent = await this.getProcedureParent(procedureId);
    const normalizedDocs = await this.normalizeDocumentsWithControlled(docs, parent);

    await this.prisma.procedure.update({
      where: { id: procedureId },
      data: {
        documents: {
          create: normalizedDocs.map((doc) => ({
            code: doc.code,
            name: doc.name,
            versions: { create: doc.versions },
          })),
        },
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
    const parent = await this.getProcedureParent(procedureId);
    const docMeta = await this.prisma.procedureDocument.findFirst({
      where: { id: documentId, procedureId },
      select: { code: true, name: true },
    });
    if (!docMeta) throw new NotFoundException('Documento no encontrado para este procedimiento');

    const stored = await this.persistControlledDocument({
      code: docMeta.code,
      name: docMeta.name,
      version: version.version,
      status: version.status ?? 'in_review',
      renewalDate: version.renewalDate ?? null,
      updatedBy: version.updatedBy ?? null,
      fileUrl: version.fileUrl ?? null,
      fileBase64: version.fileBase64 ?? null,
      fileName: version.fileName ?? null,
      ...parent,
    });

    await this.prisma.procedureDocumentVersion.create({
      data: (() => {
        return {
          version: version.version,
          fileUrl: stored.fileUrl,
          fileBase64: stored.fileBase64 ?? version.fileBase64 ?? null,
          fileName: stored.fileName ?? version.fileName ?? null,
          uploadDate: version.uploadDate ? new Date(version.uploadDate) : undefined,
          renewalDate: version.renewalDate ? new Date(version.renewalDate) : undefined,
          status: version.status ?? 'in_review',
          updatedBy: version.updatedBy ?? null,
          document: { connect: { id: documentId } },
        };
      })(),
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

  private async getProcedureParent(procedureId: string) {
    const proc = await this.prisma.procedure.findUnique({
      where: { id: procedureId },
      select: { processId: true, subprocessId: true },
    });
    if (!proc) throw new NotFoundException('Procedimiento no encontrado');
    return { processId: proc.processId, subprocessId: proc.subprocessId };
  }

  private async persistControlledDocument(opts: {
    code: string;
    name: string;
    version: string;
    status?: string;
    renewalDate?: string | Date | null;
    updatedBy?: string | null;
    fileUrl?: string | null;
    fileBase64?: string | null;
    fileName?: string | null;
    processId?: string | null;
    subprocessId?: string | null;
  }) {
    const base64 =
      opts.fileBase64 ??
      (opts.fileUrl && opts.fileUrl.startsWith('data:') ? opts.fileUrl : null);
    const plainUrl =
      opts.fileUrl && !opts.fileUrl.startsWith('data:') ? opts.fileUrl : null;
    const safeFileName =
      opts.fileName || (opts.code && opts.version ? `${opts.code}_${opts.version}` : 'documento');

    const created = await this.documentsService.create({
      code: opts.code,
      name: opts.name,
      type: 'Procedimiento',
      version: opts.version,
      status: (opts.status as any) ?? 'in_review',
      nextReview: opts.renewalDate ?? null,
      owner: opts.updatedBy ?? undefined,
      fileUrl: plainUrl ?? null,
      fileBase64: base64 ?? null,
      fileName: safeFileName,
      processId: opts.processId ?? undefined,
      subprocessId: opts.subprocessId ?? undefined,
    });

    return {
      fileUrl: created.fileUrl ?? plainUrl ?? null,
      fileBase64: created.fileBase64 ?? base64 ?? null,
      fileName: created.fileName ?? safeFileName ?? null,
    };
  }

  private async normalizeDocumentsWithControlled(
    docs: CreateProcedureDto['documents'] = [],
    parent: { processId?: string | null; subprocessId?: string | null },
  ) {
    return Promise.all(
      docs.map(async (doc) => {
        const versions = await Promise.all(
          (doc.versions ?? []).map(async (ver) => {
            const stored = await this.persistControlledDocument({
              code: doc.code,
              name: doc.name,
              version: ver.version,
              status: ver.status ?? 'in_review',
              renewalDate: ver.renewalDate ?? null,
              updatedBy: ver.updatedBy ?? null,
              fileUrl: ver.fileUrl ?? null,
              fileBase64: ver.fileBase64 ?? null,
              fileName: ver.fileName ?? null,
              processId: parent.processId ?? null,
              subprocessId: parent.subprocessId ?? null,
            });

            return {
              version: ver.version,
              fileUrl: stored.fileUrl,
              fileBase64: stored.fileBase64 ?? ver.fileBase64 ?? null,
              fileName: stored.fileName ?? ver.fileName ?? null,
              uploadDate: ver.uploadDate ? new Date(ver.uploadDate) : undefined,
              renewalDate: ver.renewalDate ? new Date(ver.renewalDate) : undefined,
              status: ver.status ?? 'in_review',
              updatedBy: ver.updatedBy ?? null,
            };
          }),
        );

        return {
          code: doc.code,
          name: doc.name,
          versions,
        };
      }),
    );
  }
}
