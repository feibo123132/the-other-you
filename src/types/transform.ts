export interface TransformOption {
  id: string;
  label: string;
  icon: string;
  category: 'style' | 'location';
  promptTemplate: string;
  previewImage?: string;
}

export interface GenerationTask {
  id: string;
  originalImage: File;
  selectedOption: TransformOption;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultImage?: string;
  createdAt: Date;
}

export interface GenerationState {
  currentTask: GenerationTask | null;
  isGenerating: boolean;
  error: string | null;
}