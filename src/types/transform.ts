export interface TransformOption {
  id: string;
  label: string;
  icon: string;
  category: 'style' | 'location' | 'portrait' | 'celebrity' | 'time_travel' | 'dream_jobs' | 'trendy_hair';
  promptTemplate: string;
  previewImage?: string;
  sortIndex?: number;
}

export interface GenerationTask {
  id: string;
  originalImage?: File; // Deprecated, kept for legacy compatibility
  originalImageUrl?: string; // Deprecated, kept for legacy compatibility
  originalImages?: File[]; // New: Store multiple files
  originalImageUrls: string[]; // New: Store multiple Base64/URLs
  selectedOption: TransformOption;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultImage?: string;
  createdAt: number;
  completedAt?: number;
  progress: number;
  progressMessage: string;
}

export interface GenerationState {
  currentTask: GenerationTask | null;
  isGenerating: boolean;
  error: string | null;
}
