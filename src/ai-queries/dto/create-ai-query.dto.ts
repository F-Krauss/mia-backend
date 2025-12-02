export class CreateAIQueryDto {
  id: string;
  question: string;
  answer: string;
  answerSummary?: string;
  sources?: { document: string; page?: number; section?: string }[];
  userId?: string;
  userName?: string;
  plantId?: string;
  processId?: string;
  subprocessId?: string;
  machineId?: string;
  contextPath?: string;
}
