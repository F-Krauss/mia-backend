export class CreateDocumentDto {
  code: string;
  name: string;
  type: string;
  version: string;
  status: string;
  nextReview?: string | Date | null;
  owner?: string;
  fileUrl?: string | null;
  fileBase64?: string | null;
  fileName?: string | null;
  plantId?: string;
  processId?: string;
  subprocessId?: string;
  machineId?: string;
}
