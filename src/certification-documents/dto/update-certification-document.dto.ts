import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificationDocumentDto } from './create-certification-document.dto';

export class UpdateCertificationDocumentDto extends PartialType(
  CreateCertificationDocumentDto,
) {}
