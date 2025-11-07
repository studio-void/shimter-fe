import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, MapPin } from "lucide-react";
import type { WeatherData } from "@/lib/api";

interface WeatherCardProps {
  weather: WeatherData;
}

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          날씨 정보
        </CardTitle>
        <CardDescription>{weather.location}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">현재 온도</p>
            <p className="text-2xl font-bold">
              {weather.temperature.toFixed(1)}°C
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">현재 습도</p>
            <p className="text-2xl font-bold">{weather.humidity.toFixed(1)}%</p>
          </div>
        </div>

        {weather.rainForecast.willRain && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <CloudRain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="bg-blue-600">
                    비 예보
                  </Badge>
                  <span className="text-sm font-medium">
                    강수 확률: {weather.rainForecast.probability}%
                  </span>
                </div>
                {weather.rainForecast.expectedTime && (
                  <p className="text-sm text-muted-foreground">
                    예상 시간: {weather.rainForecast.expectedTime}
                  </p>
                )}
                <p className="text-sm mt-2 text-blue-900 dark:text-blue-100">
                  습도가 더 높아지지 않도록 환기 및 배수 시스템을 점검하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {!weather.rainForecast.willRain && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-100">
              현재 비 예보가 없습니다. 정상적인 관리가 가능합니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
