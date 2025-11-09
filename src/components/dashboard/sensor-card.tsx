import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Thermometer, Droplets, Sun, Sprout } from "lucide-react";
import type { DashboardResponse } from "@/lib/api";

interface SensorCardProps {
  data: DashboardResponse["recommendations"];
}

export function SensorCard({ data }: SensorCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "good":
        return "양호";
      case "warning":
        return "주의";
      case "critical":
        return "위험";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 토양 수분 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">토양 수분</CardTitle>
          <Sprout className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.moisture.current.toFixed(0)}%
          </div>
          <CardDescription className="mt-2">
            최적 범위: {data.moisture.optimal.min}% ~{" "}
            {data.moisture.optimal.max}%
          </CardDescription>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>상태</span>
              <Badge
                variant="outline"
                className={`${getStatusColor(data.moisture.status)} text-white border-0`}
              >
                {getStatusText(data.moisture.status)}
              </Badge>
            </div>
            <Progress
              value={
                ((data.moisture.current - data.moisture.optimal.min) /
                  (data.moisture.optimal.max - data.moisture.optimal.min)) *
                100
              }
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.moisture.action}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 온도 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">온도</CardTitle>
          <Thermometer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.temperature.current.toFixed(1)}°C
          </div>
          <CardDescription className="mt-2">
            최적 범위: {data.temperature.optimal.min}°C ~{" "}
            {data.temperature.optimal.max}°C
          </CardDescription>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>상태</span>
              <Badge
                variant="outline"
                className={`${getStatusColor(data.temperature.status)} text-white border-0`}
              >
                {getStatusText(data.temperature.status)}
              </Badge>
            </div>
            <Progress
              value={
                ((data.temperature.current - data.temperature.optimal.min) /
                  (data.temperature.optimal.max -
                    data.temperature.optimal.min)) *
                100
              }
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.temperature.action}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 습도 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">습도</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.humidity.current.toFixed(1)}%
          </div>
          <CardDescription className="mt-2">
            최적 범위: {data.humidity.optimal.min}% ~{" "}
            {data.humidity.optimal.max}%
          </CardDescription>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>상태</span>
              <Badge
                variant="outline"
                className={`${getStatusColor(data.humidity.status)} text-white border-0`}
              >
                {getStatusText(data.humidity.status)}
              </Badge>
            </div>
            <Progress
              value={
                ((data.humidity.current - data.humidity.optimal.min) /
                  (data.humidity.optimal.max - data.humidity.optimal.min)) *
                100
              }
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.humidity.action}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 조도 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">조도</CardTitle>
          <Sun className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.illuminance.current.toFixed(0)}
          </div>
          <CardDescription className="mt-2">
            최적 범위: {data.illuminance.optimal.min} ~{" "}
            {data.illuminance.optimal.max}
            <br />
            <span className="text-xs">(낮을수록 밝음, 0-1023)</span>
          </CardDescription>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>상태</span>
              <Badge
                variant="outline"
                className={`${getStatusColor(data.illuminance.status)} text-white border-0`}
              >
                {getStatusText(data.illuminance.status)}
              </Badge>
            </div>
            <Progress
              value={
                ((data.illuminance.current - data.illuminance.optimal.min) /
                  (data.illuminance.optimal.max -
                    data.illuminance.optimal.min)) *
                100
              }
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.illuminance.action}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
