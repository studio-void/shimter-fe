import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, BluetoothConnected, BluetoothOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ArduinoBluetooth } from '@/lib/bluetooth';

interface BluetoothConnectionProps {
  onDataReceived?: (data: { temperature: number; humidity: number; illuminance: number }) => void;
}

export function BluetoothConnection({ onDataReceived }: BluetoothConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bluetooth, setBluetooth] = useState<ArduinoBluetooth | null>(null);

  useEffect(() => {
    const bt = new ArduinoBluetooth();
    if (onDataReceived) {
      bt.setDataHandler(onDataReceived);
    }
    setBluetooth(bt);

    return () => {
      bt.disconnect();
    };
  }, [onDataReceived]);

  const handleConnect = async () => {
    if (!bluetooth) return;

    setIsConnecting(true);
    setError(null);

    try {
      await bluetooth.connect();
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '연결 실패';
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!bluetooth) return;

    try {
      await bluetooth.disconnect();
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // 브라우저 블루투스 지원 확인
  const isBluetoothSupported = 'bluetooth' in navigator;

  if (!isBluetoothSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BluetoothOff className="h-5 w-5" />
            블루투스 연결
          </CardTitle>
          <CardDescription>이 브라우저는 Web Bluetooth API를 지원하지 않습니다.</CardDescription>
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
            <BluetoothConnected className="h-5 w-5 text-green-500" />
          ) : (
            <Bluetooth className="h-5 w-5" />
          )}
          아두이노 블루투스 연결
        </CardTitle>
        <CardDescription>아두이노 센서와 블루투스로 연결합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">연결 상태</p>
            <Badge
              variant={isConnected ? 'default' : 'secondary'}
              className={isConnected ? 'bg-green-500' : ''}
            >
              {isConnected ? '연결됨' : '연결 안 됨'}
            </Badge>
          </div>
          {isConnected ? (
            <Button onClick={handleDisconnect} variant="destructive">
              <BluetoothOff className="h-4 w-4 mr-2" />
              연결 해제
            </Button>
          ) : (
            <Button onClick={handleConnect} disabled={isConnecting}>
              <Bluetooth className="h-4 w-4 mr-2" />
              {isConnecting ? '연결 중...' : '연결하기'}
            </Button>
          )}
        </div>
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
          </div>
        )}
        {isConnected && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-100">
              아두이노에서 센서 데이터를 수신 중입니다...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

