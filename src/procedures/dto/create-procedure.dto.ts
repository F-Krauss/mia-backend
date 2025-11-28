export class CreateProcedureDto {
  title: string;
  description?: string;
  reviewer?: string;
  responsible?: string;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
  status?: string;
  processId?: string;
  subprocessId?: string;
  documents?: {
    code: string;
    name: string;
    versions?: {
      version: string;
      fileUrl?: string | null;
      fileBase64?: string | null;
      fileName?: string | null;
      uploadDate?: string | Date | null;
      renewalDate?: string | Date | null;
      status?: string;
      updatedBy?: string;
    }[];
  }[];
}
