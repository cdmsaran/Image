export interface ImageState {
  original: string | null;
  generated: string | null;
  mimeType: string;
}

export interface EditSettings {
  prompt: string;
  isRestoring: boolean;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
