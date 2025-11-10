import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { CameraView } from "@/components/dashboard/camera-view";
import { BluetoothConnection } from "@/components/dashboard/bluetooth-connection";
import { SerialConnection } from "@/components/dashboard/serial-connection";
import { type SensorData } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [plant, setPlant] = useState<string>("strawberry");

  // 작물별 생육 조건 정의 (예시 값)
  const plantConditions = useMemo(
    () => ({
      strawberry: {
        name: "딸기",
        moisture: { min: 30, max: 70 },
        temperature: { min: 18, max: 25 },
        humidity: { min: 60, max: 70 },
        illuminance: { min: 500, max: 1000 },
      },
      tomato: {
        name: "토마토",
        moisture: { min: 40, max: 70 },
        temperature: { min: 20, max: 27 },
        humidity: { min: 55, max: 70 },
        illuminance: { min: 700, max: 1500 },
      },
      lettuce: {
        name: "상추",
        moisture: { min: 50, max: 80 },
        temperature: { min: 15, max: 22 },
        humidity: { min: 60, max: 80 },
        illuminance: { min: 300, max: 800 },
      },
    }),
    []
  );

  // 센서 데이터 수신 핸들러
  const handleSensorData = useCallback(
    (data: {
      moisture: number;
      temperature: number;
      humidity: number;
      illuminance: number;
    }) => {
      const sensorData: SensorData = {
        moisture: data.moisture,
        temperature: data.temperature,
        humidity: data.humidity,
        illuminance: data.illuminance,
        timestamp: new Date().toISOString(),
      };
      setSensorData(sensorData);
      setLastUpdate(new Date());
    },
    []
  );

  // 로컬 추천 계산 함수
  const calculateRecommendations = useCallback(
    (data: SensorData) => {
      const current = plantConditions[plant as keyof typeof plantConditions];
      const moistureOptimal = current.moisture;
      const temperatureOptimal = current.temperature;
      const humidityOptimal = current.humidity;
      const illuminanceOptimal = current.illuminance;

      const statusFromRange = (
        current: number,
        range: { min: number; max: number }
      ): { status: "good" | "warning" | "critical"; action: string } => {
        if (current >= range.min && current <= range.max) {
          return { status: "good", action: "현재 값이 적정 범위입니다." };
        }
        const distance =
          current < range.min ? range.min - current : current - range.max;
        const severity =
          distance > (range.max - range.min) * 0.2 ? "critical" : "warning";
        const direction = current < range.min ? "낮습니다" : "높습니다";
        return {
          status: severity as "warning" | "critical",
          action: `값이 ${direction}. 조치가 필요합니다.`,
        };
      };

      return {
        currentStatus: {
          sensors: data,
          weather: {
            location: "로컬",
            temperature: 0,
            humidity: 0,
            rainForecast: { willRain: false, probability: 0 },
            timestamp: new Date().toISOString(),
          },
        },
        recommendations: {
          moisture: {
            current: data.moisture,
            optimal: moistureOptimal,
            ...statusFromRange(data.moisture, moistureOptimal),
          },
          temperature: {
            current: data.temperature,
            optimal: temperatureOptimal,
            ...statusFromRange(data.temperature, temperatureOptimal),
          },
          humidity: {
            current: data.humidity,
            optimal: humidityOptimal,
            ...statusFromRange(data.humidity, humidityOptimal),
          },
          illuminance: {
            current: data.illuminance,
            optimal: illuminanceOptimal,
            ...statusFromRange(data.illuminance, illuminanceOptimal),
          },
        },
        alerts: [],
      };
    },
    [plant, plantConditions]
  );

  // 대시보드 데이터 계산 (동기, 깜박임 방지)
  const dashboardData = useMemo(() => {
    if (!sensorData) {
      // 초기 목업 데이터
      const current = plantConditions[plant as keyof typeof plantConditions];
      return {
        currentStatus: {
          sensors: {
            moisture: 50,
            temperature: 22.5,
            humidity: 65,
            illuminance: 800,
            timestamp: new Date().toISOString(),
          },
          weather: {
            location: "서울",
            temperature: 20,
            humidity: 70,
            rainForecast: {
              willRain: false,
              probability: 10,
            },
            timestamp: new Date().toISOString(),
          },
        },
        recommendations: {
          moisture: {
            current: 50,
            optimal: current.moisture,
            action: "현재 토양 수분이 적정 범위입니다.",
            status: "good" as const,
          },
          temperature: {
            current: 22.5,
            optimal: current.temperature,
            action: "현재 온도가 적정 범위입니다.",
            status: "good" as const,
          },
          humidity: {
            current: 65,
            optimal: current.humidity,
            action: "현재 습도가 적정 범위입니다.",
            status: "good" as const,
          },
          illuminance: {
            current: 800,
            optimal: current.illuminance,
            action: "현재 조도가 적정 범위입니다.",
            status: "good" as const,
          },
        },
        alerts: [],
      };
    }
    return calculateRecommendations(sensorData);
  }, [sensorData, calculateRecommendations, plant, plantConditions]);

  // refetch 제거: 동기 계산이라 불필요

  const handleCameraCapture = useCallback((_imageData: string) => {
    // 현재는 백엔드 전송을 하지 않음. 필요 시 저장/미리보기 로직 추가 가능.
  }, []);

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              데이터를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-brand">심터</span> (Shimter)
              </h1>
              <p className="text-muted-foreground mt-1">
                {plantConditions[plant as keyof typeof plantConditions].name}{" "}
                생육 모니터링 대시보드
              </p>
            </div>
            {lastUpdate && (
              <div className="text-sm text-muted-foreground bg-gray-50 px-4 py-2 rounded-lg">
                마지막 업데이트: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* 연결 옵션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BluetoothConnection onDataReceived={handleSensorData} />
          <SerialConnection onDataReceived={handleSensorData} />
        </div>

        {/* 작물 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">작물 선택</div>
            <Select value={plant} onValueChange={(v) => setPlant(v)}>
              <SelectTrigger size="default">
                <SelectValue placeholder="작물 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strawberry">딸기</SelectItem>
                <SelectItem value="tomato">토마토</SelectItem>
                <SelectItem value="lettuce">상추</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            현재 선택된 작물의 생육 조건에 맞춰 센서 상태가 평가됩니다.
          </div>
        </div>

        {/* 센서 데이터 카드 */}
        <SensorCard data={dashboardData.recommendations} />

        {/* 날씨 정보 및 알림 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherCard weather={dashboardData.currentStatus.weather} />
          <AlertCard alerts={dashboardData.alerts} />
        </div>

        {/* 웹캠 뷰 */}
        <CameraView
          onCapture={handleCameraCapture}
          // FIXME: 실제 요구사항에 맞게 캡처 간격 조정 필요
          captureInterval={30000} // 30초마다 자동 캡처
        />
      </div>
    </div>
  );
}
