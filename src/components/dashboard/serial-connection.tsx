import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Usb, Plug, PlugZap } from "lucide-react";
import { useState, useEffect } from "react";
import { ArduinoSerial } from "@/lib/serial";

interface SerialConnectionProps {
  onDataReceived?: (data: {
    moisture: number;
    temperature: number;
    humidity: number;
    illuminance: number;
  }) => void;
}

export function SerialConnection({
  onDataReceived,
}: SerialConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serial, setSerial] = useState<ArduinoSerial | null>(null);

  useEffect(() => {
    const ser = new ArduinoSerial();
    if (onDataReceived) {
      ser.setDataHandler(onDataReceived);
    }
    setSerial(ser);

    return () => {
      ser.disconnect();
    };
  }, [onDataReceived]);

  const handleConnect = async () => {
    if (!serial) return;

    setIsConnecting(true);
    setError(null);

    try {
      await serial.connect();
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "연결 실패";
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!serial) return;

    try {
      await serial.disconnect();
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  // 브라우저 시리얼 지원 확인
  const isSerialSupported = "serial" in navigator;

  if (!isSerialSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            시리얼 연결
          </CardTitle>
          <CardDescription>
            이 브라우저는 Web Serial API를 지원하지 않습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chrome, Edge, Opera 등의 최신 브라우저를 사용해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <PlugZap className="h-5 w-5 text-green-500" />
            ) : (
              <Usb className="h-5 w-5" />
            )}
            아두이노 시리얼 연결
          </CardTitle>
        <CardDescription>
          USB 케이블로 연결된 아두이노와 시리얼 통신합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">연결 상태</p>
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-green-500" : ""}
            >
              {isConnected ? "연결됨" : "연결 안 됨"}
            </Badge>
          </div>
          {isConnected ? (
            <Button onClick={handleDisconnect} variant="destructive">
              <Plug className="h-4 w-4 mr-2" />
              연결 해제
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting}>
              <Usb className="h-4 w-4 mr-2" />
              {isConnecting ? "연결 중..." : "연결하기"}
            </Button>
          )}
        </div>
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-900 dark:text-red-100 whitespace-pre-line">
              {error}
            </p>
          </div>
        )}
        {isConnected && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-100">
              아두이노에서 센서 데이터를 수신 중입니다...
            </p>
          </div>
        )}
        {!isConnected && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 USB 케이블로 아두이노를 컴퓨터에 연결한 후 연결하기 버튼을 눌러주세요.
              <br />
              보드레이트: 38400
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

