import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Video, VideoOff } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { CameraCapture } from "@/lib/camera";

interface CameraViewProps {
  onCapture?: (imageData: string) => void;
  captureInterval?: number; // 자동 캡처 간격 (ms)
}

// FIXME: 기본 캡처 간격을 실제 요구사항에 맞게 조정 필요
export function CameraView({
  onCapture,
  captureInterval = 30000,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<CameraCapture | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isStreaming && videoRef.current) {
      const camera = new CameraCapture();
      cameraRef.current = camera;
      camera
        .initialize(videoRef.current)
        .then(() => {
          setIsStreaming(true);
        })
        .catch((error) => {
          console.error("Failed to initialize camera:", error);
          setIsStreaming(false);
        });
    }

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [isStreaming]);

  // 자동 캡처
  useEffect(() => {
    if (!isStreaming || !captureInterval) return;

    const interval = setInterval(() => {
      if (cameraRef.current) {
        const imageData = cameraRef.current.captureImage();
        if (imageData && onCapture) {
          onCapture(imageData);
          setLastCaptureTime(new Date());
        }
      }
    }, captureInterval);

    return () => clearInterval(interval);
  }, [isStreaming, captureInterval, onCapture]);

  const handleManualCapture = () => {
    if (cameraRef.current) {
      const imageData = cameraRef.current.captureImage();
      if (imageData && onCapture) {
        onCapture(imageData);
        setLastCaptureTime(new Date());
      }
    }
  };

  const toggleStream = () => {
    if (isStreaming) {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      setIsStreaming(false);
    } else {
      setIsStreaming(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          실시간 웹캠
        </CardTitle>
        <CardDescription>
          딸기 생육 상태 모니터링
          {lastCaptureTime && (
            <span className="ml-2 text-xs">
              (마지막 캡처: {lastCaptureTime.toLocaleTimeString()})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <VideoOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>카메라가 꺼져 있습니다</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleStream}
            variant={isStreaming ? "destructive" : "default"}
          >
            {isStreaming ? (
              <>
                <VideoOff className="h-4 w-4 mr-2" />
                중지
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                시작
              </>
            )}
          </Button>
          <Button
            onClick={handleManualCapture}
            disabled={!isStreaming}
            variant="outline"
          >
            <Camera className="h-4 w-4 mr-2" />
            수동 캡처
          </Button>
        </div>
        {captureInterval && (
          <p className="text-xs text-muted-foreground">
            자동 캡처 간격: {captureInterval / 1000}초
          </p>
        )}
      </CardContent>
    </Card>
  );
}
