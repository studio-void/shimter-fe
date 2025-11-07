import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { CameraView } from "@/components/dashboard/camera-view";
import { BluetoothConnection } from "@/components/dashboard/bluetooth-connection";
import {
  sendCombinedData,
  sendCameraData,
  type SensorData,
  type CameraData,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 센서 데이터 수신 핸들러
  const handleSensorData = useCallback(
    (data: { temperature: number; humidity: number; illuminance: number }) => {
      const sensorData: SensorData = {
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

  // 대시보드 데이터 조회
  const { data: dashboardData, refetch: refetchDashboard } = useQuery({
    queryKey: ["dashboard", sensorData?.timestamp],
    queryFn: async () => {
      if (!sensorData) {
        // FIXME: 실제 백엔드 연결 후 목업 데이터 제거 필요
        // 센서 데이터가 없으면 목업 데이터 반환
        return {
          currentStatus: {
            sensors: {
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
            temperature: {
              current: 22.5,
              optimal: { min: 18, max: 25 },
              action: "현재 온도가 적정 범위입니다.",
              status: "good" as const,
            },
            humidity: {
              current: 65,
              optimal: { min: 60, max: 70 },
              action: "현재 습도가 적정 범위입니다.",
              status: "good" as const,
            },
            illuminance: {
              current: 800,
              optimal: { min: 500, max: 1000 },
              action: "현재 조도가 적정 범위입니다.",
              status: "good" as const,
            },
          },
          alerts: [],
        };
      }

      const response = await sendCombinedData(sensorData);
      return response;
    },
    enabled: true,
    // FIXME: 실제 요구사항에 맞게 데이터 갱신 주기 조정 필요
    refetchInterval: 10000, // 10초마다 갱신
  });

  // 카메라 데이터 전송 mutation
  const cameraMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const cameraData: CameraData = {
        image: imageData,
        timestamp: new Date().toISOString(),
      };
      return sendCameraData(cameraData);
    },
    onSuccess: () => {
      refetchDashboard();
    },
  });

  // 센서 데이터가 변경되면 자동으로 전송
  useEffect(() => {
    if (sensorData) {
      refetchDashboard();
    }
  }, [sensorData, refetchDashboard]);

  const handleCameraCapture = useCallback(
    (imageData: string) => {
      cameraMutation.mutate(imageData);
    },
    [cameraMutation]
  );

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
                딸기 생육 모니터링 대시보드
              </p>
            </div>
            {lastUpdate && (
              <div className="text-sm text-muted-foreground bg-gray-50 px-4 py-2 rounded-lg">
                마지막 업데이트: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* 블루투스 연결 */}
        <BluetoothConnection onDataReceived={handleSensorData} />

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
