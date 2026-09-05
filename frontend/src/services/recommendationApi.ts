import axios from 'axios';

const RECOMMENDATION_API_URL =
  import.meta.env.VITE_RECOMMENDATION_API_URL || 'http://localhost:8001';

const recommendationApi = axios.create({
  baseURL: RECOMMENDATION_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await recommendationApi.post<RecommendationResponse>(
      '/recommendations',
      request
    );
    return response.data;
  },

  health: async (): Promise<boolean> => {
    try {
      const response = await recommendationApi.get('/recommendations/health');
      return response.status === 200;
    } catch {
      return false;
    }
  },
};
