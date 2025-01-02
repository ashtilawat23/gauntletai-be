export interface ProjectSubmission {
    id: number;
    student_id: number;
    week_number: number;
    video_url: string;
    github_url: string;
    social_url: string;
    document_url: string;
    social_engagement: number;
    is_passed: boolean | null;
    submitted_at: Date;
    graded_at: Date | null;
    graded_by: number | null;
  }
  
  export interface CreateProjectSubmissionDTO {
    week_number: number;
    video_url: string;
    github_url: string;
    social_url: string;
    document_url: string;
  }