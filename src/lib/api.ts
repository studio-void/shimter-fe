import axios from "axios";

// API 타입 정의
export interface SensorData {
  moisture: number; // 토양 수분 (0-100%)
  temperature: number; // 온도 (°C)
  humidity: number; // 습도 (%)
  illuminance: number; // 조도 (0-1023, 낮을수록 밝음)
  timestamp: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainForecast: {
    willRain: boolean;
    probability: number; // 0-100
    expectedTime?: string; // 예상 시간
  };
  timestamp: string;
}

export interface CameraData {
  image: string; // base64 encoded image
  timestamp: string;
}

export interface DashboardResponse {
  currentStatus: {
    sensors: SensorData;
    weather: WeatherData;
    camera?: CameraData;
  };
  recommendations: {
    moisture: {
      current: number;
      optimal: { min: number; max: number };
      action: string;
      status: "good" | "warning" | "critical";
    };
    temperature: {
      current: number;
      optimal: { min: number; max: number };
      action: string;
      status: "good" | "warning" | "critical";
    };
    humidity: {
      current: number;
      optimal: { min: number; max: number };
      action: string;
      status: "good" | "warning" | "critical";
    };
    illuminance: {
      current: number;
      optimal: { min: number; max: number };
      action: string;
      status: "good" | "warning" | "critical";
    };
  };
  alerts: Array<{
    type: "info" | "warning" | "error";
    message: string;
    priority: "low" | "medium" | "high";
  }>;
}

// FIXME: 실제 백엔드 서버 URL로 변경 필요
// .env 파일에 VITE_API_BASE_URL을 설정하거나 여기서 직접 변경
// API 엔드포인트 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// ---------- DTO Types ----------

export interface PostDto {
  id: string;
  title: string;
  content: string;
}

export interface PostListDto {
  posts: PostDto[];
  total: number;
}

export interface CreatePostDto {
  title: string;
  content: string;
}

export interface ResultDto {
  class: string;
  confidence: Record<string, unknown> | string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  deviceId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  deviceId: string;
}

export interface LogDto {
  description: string;
  createdAt: string;
}

export interface DiseaseLogDto {
  disease: string;
  description: string;
  createdAt: string;
  overcome: boolean;
}

export interface PlantDto {
  id: string;
  logs: LogDto;
  diseaseLogs: DiseaseLogDto;
}

export interface PlantListDto {
  plants: PlantDto[];
  total: number;
}

export interface CreateLogDto {
  description: string;
}

export interface CreateDiseaseLogDto {
  disease: string;
  description: string;
}

// ---------- Posts ----------

export async function getPostList(params: { skip: number; take: number }) {
  const { data } = await apiClient.get<PostListDto>("/post", { params });
  return data;
}

export async function createPost(payload: CreatePostDto) {
  const { data } = await apiClient.post<PostDto>("/post", payload);
  return data;
}

export async function getPost(id: string) {
  const { data } = await apiClient.get<PostDto>(`/post/${id}`);
  return data;
}

// ---------- AI ----------

export async function getAiPrediction(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<ResultDto>("/ai", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ---------- Users ----------

export async function joinUser(payload: CreateUserDto) {
  await apiClient.post("/user/join", payload);
}

export async function loginUser(payload: LoginDto) {
  await apiClient.post("/user/login", payload);
}

export async function getUser(id: string) {
  const { data } = await apiClient.get<UserDto>(`/user/${id}`);
  return data;
}

// ---------- Plants ----------

export async function getPlantList(params: { skip: number; take: number }) {
  const { data } = await apiClient.get<PlantListDto>("/plant", { params });
  return data;
}

export async function createPlant() {
  const { data } = await apiClient.post<PlantDto>("/plant");
  return data;
}

export async function getPlant(id: string) {
  const { data } = await apiClient.get<PlantDto>(`/plant/${id}`);
  return data;
}

export async function addPlantLog(id: string, payload: CreateLogDto) {
  const { data } = await apiClient.post<PlantDto>(`/plant/${id}`, payload);
  return data;
}

export async function addDiseaseLog(id: string, payload: CreateDiseaseLogDto) {
  const { data } = await apiClient.post<PlantDto>(
    `/plant/disease/${id}`,
    payload
  );
  return data;
}

export async function changeDiseaseStatus(id: string) {
  const { data } = await apiClient.patch<PlantDto>(`/plant/disease/${id}`);
  return data;
}

// FIXME: 실제 백엔드 API 엔드포인트 경로로 변경 필요
export async function sendSensorData(
  data: SensorData
): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sensors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // FIXME: 실제 백엔드 에러 응답 형식에 맞게 에러 처리 수정 필요
    throw new Error(`Failed to send sensor data: ${response.statusText}`);
  }

  return response.json();
}

// FIXME: 실제 백엔드 API 엔드포인트 경로로 변경 필요
export async function sendCameraData(
  data: CameraData
): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/camera`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // FIXME: 실제 백엔드 에러 응답 형식에 맞게 에러 처리 수정 필요
    throw new Error(`Failed to send camera data: ${response.statusText}`);
  }

  return response.json();
}

// FIXME: 실제 백엔드 API 엔드포인트 경로로 변경 필요
export async function sendCombinedData(
  sensorData: SensorData,
  cameraData?: CameraData
): Promise<DashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // FIXME: 실제 백엔드에서 요구하는 요청 본문 형식에 맞게 수정 필요
    body: JSON.stringify({
      sensors: sensorData,
      camera: cameraData,
    }),
  });

  if (!response.ok) {
    // FIXME: 실제 백엔드 에러 응답 형식에 맞게 에러 처리 수정 필요
    throw new Error(`Failed to send combined data: ${response.statusText}`);
  }

  return response.json();
}
