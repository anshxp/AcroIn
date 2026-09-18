import api from './api';

export interface RecommendationRequest {
  requirements?: string;
  department?: string | null;
  required_skills?: string[];
  preferred_skills?: string[];
  min_cgpa?: number | null;
  top_n?: number;
}

export interface RecommendationItem {
  student_id: string | null;
  name: string;
  department: string | null;
  year: string | null;
  cgpa: number | null;
  profile_image: string | null;
  verification_status: string | null;
  face_verification_status: string | null;
  profile_completeness: number | null;
  match_score: number;
  match_percent: number;
  matched_skills: string[];
  missing_skills: string[];
  reasons: string[];
  summary: string;
}

export interface RecommendationResponse {
  success: boolean;
  data: RecommendationItem[];
  total: number;
  source: string;
}

export const recommendationAPI = {
  recommend: async (
    request: RecommendationRequest
  ): Promise<RecommendationResponse> => {
    const response = await api.post<RecommendationResponse>(
      '/faculty/recommendations',
      request
    );
    return response.data;
  },
};
