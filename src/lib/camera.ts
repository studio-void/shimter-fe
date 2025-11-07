// 웹캠 캡처 기능

export class CameraCapture {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initialize(videoElement: HTMLVideoElement): Promise<void> {
    try {
      this.videoElement = videoElement;
      // FIXME: 실제 웹캠 해상도 및 설정에 맞게 조정 필요
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      videoElement.srcObject = this.stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      throw error;
    }
  }

  captureImage(): string | null {
    if (!this.videoElement) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    ctx.drawImage(this.videoElement, 0, 0);
    // FIXME: 이미지 품질 및 포맷을 실제 요구사항에 맞게 조정 필요
    return canvas.toDataURL("image/jpeg", 0.8);
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
  }
}
