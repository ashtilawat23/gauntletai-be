export type ResourceType = 'recording' | 'github' | 'slides' | 'document' | 'community';

export interface Resource {
  id: number;
  title: string;
  url: string;
  type: ResourceType;
  week_number: number | null;  // null for general resources
  cohort_id: number;
  created_by: number;
  created_at: Date;
  description?: string;
}

export interface CreateResourceDTO {
  title: string;
  url: string;
  type: ResourceType;
  week_number?: number;
  cohort_id: number;
  description?: string;
}

export interface UpdateResourceDTO {
  title?: string;
  url?: string;
  description?: string;
}