import { apiClient } from "./api";

export interface AIAnalysisResponse {
  class:
    | "normal"
    | "temp-humid"
    | "unripe"
    | "disease_powdery"
    | "disease_intonsa"
    | "disease_latus";
  confidence: string;
}

export const postAIAnalysis = async (
  file: File | Blob
): Promise<AIAnalysisResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<AIAnalysisResponse>("/ai", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
