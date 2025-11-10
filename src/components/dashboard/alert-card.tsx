import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
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
        <CardDescription>선택한 작물 조건과 센서 수신 로그</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup className="max-h-64 overflow-y-auto pr-1 space-y-2">
          {sortedAlerts.map((alert, index) => (
            <Item key={index} variant="outline" className="items-start">
              <ItemContent>
                <ItemHeader>
                  <ItemTitle>
                    <span className="inline-flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      {alert.type === "error" && "긴급"}
                      {alert.type === "warning" && "주의"}
                      {alert.type === "info" && "정보"}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({alert.priority === "high" && "높음"}
                        {alert.priority === "medium" && "보통"}
                        {alert.priority === "low" && "낮음"})
                      </span>
                    </span>
                  </ItemTitle>
                </ItemHeader>
                <div className="text-sm leading-snug text-balance whitespace-pre-wrap">
                  {alert.message}
                </div>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
