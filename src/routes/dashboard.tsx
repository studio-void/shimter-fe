import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useMemo, useEffect } from "react";
import { SensorCard } from "@/components/dashboard/sensor-card";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { AlertCard } from "@/components/dashboard/alert-card";
import { CameraView } from "@/components/dashboard/camera-view";
import { BluetoothConnection } from "@/components/dashboard/bluetooth-connection";
import { SerialConnection } from "@/components/dashboard/serial-connection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type SensorData, type WeatherData } from "@/lib/api";
import { postAIAnalysis, type AIAnalysisResponse } from "@/lib/ai";
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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<
    Array<{
      type: "info" | "warning" | "error";
      message: string;
      priority: "low" | "medium" | "high";
    }>
  >([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);

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

  const pushAlert = useCallback(
    (
      type: "info" | "warning" | "error",
      message: string,
      priority: "low" | "medium" | "high" = "low"
    ) => {
      setAlerts((prev) => {
        const next = [{ type, message, priority }, ...prev];
        return next.slice(0, 50);
      });
    },
    [setAlerts]
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
      const now = new Date();
      const time = now.toLocaleTimeString("ko-KR", { hour12: false });
      const msg = `센서 수신 ${time} - 토양 ${data.moisture}% / 온도 ${data.temperature}°C / 습도 ${data.humidity}% / 조도 ${data.illuminance} lux`;
      pushAlert("info", msg, "low");
    },
    [pushAlert]
  );

  // 로컬 추천 계산 함수
  const calculateRecommendations = useCallback(
    (data: SensorData) => {
      const current = plantConditions[plant as keyof typeof plantConditions];
      const moistureOptimal = current.moisture;
      const temperatureOptimal = current.temperature;
      const humidityOptimal = current.humidity;
      const illuminanceOptimal = current.illuminance;

      const makeAdvice = (
        metric: "moisture" | "temperature" | "humidity" | "illuminance",
        value: number,
        range: { min: number; max: number },
        unit: string
      ): { status: "good" | "warning" | "critical"; action: string } => {
        if (value >= range.min && value <= range.max) {
          return {
            status: "good",
            action: `현재 ${value}${unit}로 적정 범위(${range.min}${unit} ~ ${range.max}${unit})입니다.`,
          };
        }

        const diff = value < range.min ? range.min - value : value - range.max;
        const span = range.max - range.min || 1;
        const severity =
          diff > span * 0.2 ? ("critical" as const) : ("warning" as const);
        const dir = value < range.min ? "낮습니다" : "높습니다";

        // 메트릭별 구체 조치
        let actionDetail = "";
        switch (metric) {
          case "moisture":
            actionDetail =
              value < range.min
                ? "화분에 물을 주고, 건조가 심하면 흙을 충분히 적셔주세요."
                : "과습입니다. 물 주기를 중단하고 배수를 개선하거나 통풍을 늘려주세요.";
            break;
          case "temperature":
            actionDetail =
              value < range.min
                ? "보온이 필요합니다. 실내 이동, 보온덮개, 히터 등을 활용하세요."
                : "온도가 높습니다. 환기/그늘 제공, 직사광선 차단, 냉각을 고려하세요.";
            break;
          case "humidity":
            actionDetail =
              value < range.min
                ? "가습이 필요합니다. 분무, 물받침대, 가습기 등을 사용하세요."
                : "습도가 높습니다. 환기와 제습을 통해 곰팡이 발생을 예방하세요.";
            break;
          case "illuminance":
            actionDetail =
              value < range.min
                ? "조도가 낮습니다. 생장 LED를 켜거나 더 밝은 장소로 옮기세요."
                : "조도가 높습니다. 차광하거나 조명의 거리를 늘려 광해를 줄이세요.";
            break;
        }

        return {
          status: severity,
          action: `현재 ${value}${unit}로 ${dir}. 적정 범위는 ${range.min}${unit} ~ ${range.max}${unit}입니다. ${actionDetail}`,
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
            ...makeAdvice("moisture", data.moisture, moistureOptimal, "%"),
          },
          temperature: {
            current: data.temperature,
            optimal: temperatureOptimal,
            ...makeAdvice(
              "temperature",
              data.temperature,
              temperatureOptimal,
              "°C"
            ),
          },
          humidity: {
            current: data.humidity,
            optimal: humidityOptimal,
            ...makeAdvice("humidity", data.humidity, humidityOptimal, "%"),
          },
          illuminance: {
            current: data.illuminance,
            optimal: illuminanceOptimal,
            ...makeAdvice(
              "illuminance",
              data.illuminance,
              illuminanceOptimal,
              " lux"
            ),
          },
        },
        alerts: [],
      };
    },
    [plant, plantConditions]
  );

  const analysisDescriptions: Record<AIAnalysisResponse["class"], string> = {
    normal: "정상 상태로 판별되었습니다.",
    "temp-humid": "온도/습도에 이상 징후가 감지되었습니다.",
    unripe: "덜 익은 개체로 감지되었습니다.",
    disease_powdery: "흰가루병 병징이 의심됩니다.",
    disease_intonsa: "잎곰팡이병 병징이 의심됩니다.",
    disease_latus: "잿빛곰팡이병 병징이 의심됩니다.",
  };

  // 공공 날씨(Open-Meteo) - 광주과학기술원(첨단동) 현재 날씨 주기 조회
  const fetchWeather = useCallback(async () => {
    try {
      const url =
        "https://api.open-meteo.com/v1/forecast?latitude=35.2284&longitude=126.842&current=temperature_2m,relative_humidity_2m&hourly=precipitation_probability&forecast_days=1&timezone=Asia%2FSeoul";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const currentTemp = Number(data?.current?.temperature_2m ?? 0);
      const currentHumidity = Number(data?.current?.relative_humidity_2m ?? 0);
      const hourlyTimes: string[] = data?.hourly?.time ?? [];
      const hourlyProb: number[] =
        data?.hourly?.precipitation_probability ?? [];
      let willRain = false;
      let probability = 0;
      let expectedTime: string | undefined = undefined;
      if (Array.isArray(hourlyProb) && hourlyProb.length > 0) {
        let maxIdx = 0;
        for (let i = 1; i < hourlyProb.length; i++) {
          if (hourlyProb[i] > hourlyProb[maxIdx]) maxIdx = i;
        }
        probability = Number(hourlyProb[maxIdx] ?? 0);
        willRain = probability >= 50;
        expectedTime = hourlyTimes[maxIdx];
      }
      const w: WeatherData = {
        location: "광주과학기술원(첨단동, 광주)",
        temperature: currentTemp,
        humidity: currentHumidity,
        rainForecast: { willRain, probability, expectedTime },
        timestamp: new Date().toISOString(),
      };
      setWeather(w);
    } catch {}
  }, []);

  useEffect(() => {
    // 초기 즉시 한 번
    fetchWeather();
    // 10분마다 갱신
    const t = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchWeather]);

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
          weather: weather ?? {
            location: "광주과학기술원(첨단동, 광주)",
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
        alerts,
      };
    }
    const base = calculateRecommendations(sensorData);
    return {
      ...base,
      currentStatus: {
        ...base.currentStatus,
        weather:
          weather ??
          base.currentStatus.weather ??
          ({
            location: "광주과학기술원(첨단동, 광주)",
            temperature: 0,
            humidity: 0,
            rainForecast: { willRain: false, probability: 0 },
            timestamp: new Date().toISOString(),
          } as WeatherData),
      },
      alerts,
    };
  }, [
    sensorData,
    calculateRecommendations,
    plant,
    plantConditions,
    weather,
    alerts,
  ]);

  // refetch 제거: 동기 계산이라 불필요

  const handleCameraCapture = useCallback(
    (imageData: string) => {
      const process = async () => {
        try {
          pushAlert("info", "AI 분석을 시작합니다.", "low");
          const blob = await (await fetch(imageData)).blob();
          const result = await postAIAnalysis(blob);
          setAiAnalysis(result);
          pushAlert(
            "info",
            `AI 분석 완료: ${result.class} (신뢰도 ${result.confidence})`,
            "medium"
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "알 수 없는 오류";
          pushAlert("error", `AI 분석 실패: ${message}`, "medium");
        }
      };
      void process();
    },
    [pushAlert]
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
          <SerialConnection
            onDataReceived={handleSensorData}
            onLogReceived={(type, message, priority) =>
              pushAlert(type, message, priority)
            }
          />
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

        {/* AI 분석 결과 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 생육 분석</CardTitle>
            <CardDescription>
              웹캠으로 촬영한 사진을 기반으로 한 상태 분석 결과
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiAnalysis ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold">
                  {aiAnalysis.class}
                  <span className="ml-2 text-sm text-muted-foreground">
                    (신뢰도 {aiAnalysis.confidence})
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysisDescriptions[aiAnalysis.class] ??
                    "분석 결과에 대한 설명을 찾을 수 없습니다."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                아직 분석 결과가 없습니다. 카메라를 시작하고 사진을 캡처하면
                분석이 진행됩니다.
              </p>
            )}
          </CardContent>
        </Card>

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
