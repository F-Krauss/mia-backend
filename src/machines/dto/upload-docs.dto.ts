import { IsArray, IsString } from 'class-validator';

export class MachineDocumentItemDto {
  @IsString()
  name: string;

  @IsString()
  mimeType: string;

  @IsString()
  base64Data: string;
}

// src/machines/dto/upload-docs.dto.ts
export class UploadMachineDocsDto {
  documents: {
    name: string;
    mimeType: string;
    base64Data: string;
  }[];
}
