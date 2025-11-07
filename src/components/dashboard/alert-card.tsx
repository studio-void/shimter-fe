import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { DashboardResponse } from "@/lib/api";

interface AlertCardProps {
  alerts: DashboardResponse["alerts"];
}

export function AlertCard({ alerts }: AlertCardProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === "error" ? "destructive" : "default";
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>알림</CardTitle>
          <CardDescription>현재 알림이 없습니다.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 우선순위에 따라 정렬 (high > medium > low)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림 및 권장사항</CardTitle>
        <CardDescription>딸기 생육 조건에 대한 중요 알림</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAlerts.map((alert, index) => (
          <Alert key={index} variant={getAlertVariant(alert.type)}>
            <div className="flex items-start gap-2">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <AlertTitle className="flex items-center gap-2">
                  {alert.type === "error" && "긴급"}
                  {alert.type === "warning" && "주의"}
                  {alert.type === "info" && "정보"}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({alert.priority === "high" && "높음"}
                    {alert.priority === "medium" && "보통"}
                    {alert.priority === "low" && "낮음"})
                  </span>
                </AlertTitle>
                <AlertDescription className="mt-1">
                  {alert.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
