import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCertificationDocumentDto } from './dto/create-certification-document.dto';
import { UpdateCertificationDocumentDto } from './dto/update-certification-document.dto';

@Injectable()
export class CertificationDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.certificationDocument.findMany({
      orderBy: [
        { code: 'asc' },
        { version: 'desc' },
      ],
    });
  }

  async create(dto: CreateCertificationDocumentDto) {
    try {
      console.log('[CertificationDocumentsService] Creating doc:', {
        code: dto.code,
        name: dto.name,
        version: dto.version,
        hasFile: !!dto.fileBase64,
      });
      const result = await this.prisma.certificationDocument.create({
        data: this.mapCreateDto(dto),
      });
      console.log('[CertificationDocumentsService] Created doc id:', result.id);
      return result;
    } catch (error: any) {
      console.error('[CertificationDocumentsService] Error creating doc:', error?.message || error);
      // Re-throw with more context for unique constraint violations
      if (error?.code === 'P2002') {
        throw new Error(
          `Ya existe un documento con código "${dto.code}" y versión "${dto.version}". Use un código o versión diferente.`,
        );
      }
      throw error;
    }
  }

  update(id: string, dto: UpdateCertificationDocumentDto) {
    return this.prisma.certificationDocument.update({
      where: { id },
      data: this.mapUpdateDto(dto),
    });
  }

  async remove(id: string) {
    await this.prisma.certificationDocument.delete({ where: { id } });
    return { success: true };
  }

  private parseNextReview(nextReview?: string | Date | null) {
    if (!nextReview || nextReview === 'N/A') return null;
    const parsedDate = new Date(nextReview);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private ensureUploadsDir() {
    const dir = join(process.cwd(), 'uploads', 'certdocs');
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  private maybePersistFile(
    fileBase64?: string | null,
    fileName?: string | null,
  ): string | null {
    if (!fileBase64 || !fileName) return null;
    try {
      const dir = this.ensureUploadsDir();
      const cleanedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${Date.now()}_${cleanedName}`;
      const filePath = join(dir, filename);
      const base64Data = fileBase64.replace(/^data:.*;base64,/, '');
      writeFileSync(filePath, base64Data, 'base64');
      return `/api/uploads/certdocs/${filename}`;
    } catch (err) {
      console.error('Error saving certification file', err);
      return null;
    }
  }

  private mapCreateDto(
    dto: CreateCertificationDocumentDto,
  ): Prisma.CertificationDocumentCreateInput {
    const savedUrl = this.maybePersistFile(dto.fileBase64, dto.fileName);
    return {
      code: dto.code,
      name: dto.name,
      type: dto.type,
      version: dto.version,
      status: dto.status,
      owner: dto.owner,
      fileUrl: savedUrl ?? dto.fileUrl ?? null,
      nextReview: this.parseNextReview(dto.nextReview),
    };
  }

  private mapUpdateDto(
    dto: UpdateCertificationDocumentDto,
  ): Prisma.CertificationDocumentUpdateInput {
    const savedUrl = this.maybePersistFile(dto.fileBase64, dto.fileName);
    const data: Prisma.CertificationDocumentUpdateInput = {
      code: dto.code,
      name: dto.name,
      type: dto.type,
      version: dto.version,
      status: dto.status,
      owner: dto.owner,
      fileUrl: savedUrl ?? dto.fileUrl ?? null,
    };

    if ('nextReview' in dto) {
      data.nextReview = this.parseNextReview(dto.nextReview);
    }

    return data;
  }
}
