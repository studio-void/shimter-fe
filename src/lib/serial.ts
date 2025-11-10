// 아두이노 시리얼 통신 (Web Serial API)

export class ArduinoSerial {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private dataBuffer: string = ""; // 데이터 버퍼 (청크 단위 수신 대응)
  private isReading: boolean = false;
  private readIntervalMs: number = 0; // 각 청크 처리 후 대기 시간(ms)
  private readCount: number = 0; // 유효 데이터 수신 횟수
  private currentBaudRate: number = 38400;
  private onDataReceived?: (data: {
    moisture: number; // 토양 수분 (0-100%)
    temperature: number; // 온도 (°C)
    humidity: number; // 습도 (%)
    illuminance: number; // 조도 (0-1023, 낮을수록 밝음)
  }) => void;
  private onLog?: (
    type: "info" | "warning" | "error",
    message: string,
    priority: "low" | "medium" | "high"
  ) => void;

  async connect(options?: {
    baudRate?: number;
    readIntervalMs?: number;
  }): Promise<void> {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API is not supported in this browser");
      }

      // 옵션 반영
      this.readIntervalMs = options?.readIntervalMs ?? 0;
      const baudRate = options?.baudRate ?? 38400;
      this.currentBaudRate = baudRate;

      // 포트가 이미 존재하고 열려 있으면 재사용
      if (this.port && (this.port.readable || this.port.writable)) {
        // 이미 열려 있는 상태 → 읽기만 시작
        if (!this.isReading) {
          this.isReading = true;
          this.readCount = 0;
          const textDecoder = new TextDecoder();
          this.readLoop(textDecoder);
        }
        return;
      }

      // 포트가 없으면 사용자에게 선택 요청
      if (!this.port) {
        this.port = await navigator.serial.requestPort();
      }

      // 아두이노 코드에서 사용하는 보드레이트: 38400
      // 이미 열려 있지 않다면 오픈
      if (!(this.port.readable || this.port.writable)) {
        await this.port.open({ baudRate });
      }

      // 읽기/쓰기 스트림 설정
      const textDecoder = new TextDecoder();

      // 쓰기 스트림
      if (this.port.writable) {
        this.writer = this.port.writable.getWriter();
      }

      // 읽기 스트림
      if (this.port.readable) {
        this.isReading = true;
        this.readCount = 0;

        // 데이터 읽기 루프
        this.readLoop(textDecoder);
      } else {
        throw new Error("시리얼 포트를 읽을 수 없습니다.");
      }
    } catch (error) {
      // 연결 에러를 알림으로 전달
      if (error instanceof Error) {
        this.onLog?.("error", `시리얼 연결 실패: ${error.message}`, "medium");
      }

      // 더 자세한 에러 메시지 제공
      if (error instanceof Error) {
        if (
          error.name === "InvalidStateError" ||
          error.message.includes("already open")
        ) {
          // 이미 열린 상태. 읽기만 보장하고 종료
          if (this.port && this.port.readable && !this.isReading) {
            this.isReading = true;
            this.readCount = 0;
            const textDecoder = new TextDecoder();
            this.readLoop(textDecoder);
            return;
          }
          // 그 외는 사용자 친화적 메시지
          throw new Error("이미 열린 포트입니다. 기존 연결로 계속 수신합니다.");
        }
        if (error.message.includes("No port selected")) {
          throw new Error("포트 선택이 취소되었습니다.");
        } else if (error.message.includes("not supported")) {
          throw new Error(
            "Web Serial API를 지원하지 않는 브라우저입니다.\n" +
              "Chrome, Edge, Opera 등의 최신 브라우저를 사용해주세요."
          );
        }
      }

      throw error;
    }
  }

  private async readLoop(decoder: TextDecoder): Promise<void> {
    // Web Serial 권장 패턴 + 견고한 자동 재시도:
    // - isReading이 true인 동안 계속 시도
    // - readable이 일시적으로 없으면 대기 후 재시도
    while (this.isReading) {
      if (!this.port) {
        await new Promise((r) => setTimeout(r, 100));
        continue;
      }
      if (!this.port.readable) {
        // 읽기 스트림이 사라졌다면 포트를 재오픈 시도 (장치 리셋 등 대비)
        try {
          await this.port.close().catch(() => {});
          await this.port.open({ baudRate: this.currentBaudRate });
        } catch {
          // 잠시 대기 후 재시도
        }
        await new Promise((r) => setTimeout(r, 100));
        continue;
      }
      try {
        this.reader = this.port.readable.getReader();
        // 내부 루프: 현재 reader가 끝날 때까지 읽는다
        for (;;) {
          const { value, done } = await this.reader.read();
          if (done) {
            break; // 현재 reader 종료 → finally에서 release 후 바깥 while에서 재시도
          }
          if (value) {
            const text = decoder.decode(value, { stream: true });
            this.processData(text);
            // 요청된 간격만큼 대기 (과도한 폴링 방지)
            if (this.readIntervalMs > 0) {
              await new Promise((r) => setTimeout(r, this.readIntervalMs));
            }
          }
        }
      } catch (error) {
        if (this.isReading && error instanceof Error) {
          this.onLog?.("warning", `시리얼 읽기 에러: ${error.message}`, "low");
        }
      } finally {
        try {
          if (this.reader) {
            this.reader.releaseLock();
          }
        } catch (e) {
          // ignore
        }
        this.reader = null;
      }
      // 소폭 딜레이 후 재시도 (busy loop 방지)
      if (this.isReading) {
        await new Promise((r) => setTimeout(r, 10));
      }
    }
    // 루프 종료 알림
    this.onLog?.("info", "시리얼 읽기 종료", "low");
  }

  private processData(text: string): void {
    // 버퍼에 추가 (데이터가 청크 단위로 올 수 있음)
    this.dataBuffer += text;

    // 줄바꿈 문자로 분리하여 완전한 라인 처리
    const lines = this.dataBuffer.split("\n");

    // 마지막 줄은 완전하지 않을 수 있으므로 버퍼에 보관
    this.dataBuffer = lines.pop() || "";

    for (const line of lines) {
      if (line.length === 0) continue;

      try {
        // 아두이노에서 보내는 CSV 형식: MOIST,TEMP,HUMI,CDS
        // 예: "050,25,60,500\n"
        const parts = line.trim().split(",");

        if (parts.length === 4) {
          const moisture = parseInt(parts[0], 10); // 토양 수분 (0-100%)
          const temperature = parseInt(parts[1], 10); // 온도 (°C)
          const humidity = parseInt(parts[2], 10); // 습도 (%)
          const illuminance = parseInt(parts[3], 10); // 조도 (0-1023)

          // 유효성 검사
          if (
            !isNaN(moisture) &&
            !isNaN(temperature) &&
            !isNaN(humidity) &&
            !isNaN(illuminance)
          ) {
            const data = {
              moisture: Math.max(0, Math.min(100, moisture)), // 0-100 범위로 제한
              temperature,
              humidity,
              illuminance,
            };

            this.readCount += 1;

            this.onDataReceived?.(data);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          this.onLog?.(
            "warning",
            `시리얼 데이터 파싱 에러: ${error.message}`,
            "low"
          );
        }
      }
    }
  }

  setDataHandler(
    handler: (data: {
      moisture: number;
      temperature: number;
      humidity: number;
      illuminance: number;
    }) => void
  ): void {
    this.onDataReceived = handler;
  }

  setLogHandler(
    handler: (
      type: "info" | "warning" | "error",
      message: string,
      priority: "low" | "medium" | "high"
    ) => void
  ): void {
    this.onLog = handler;
  }

  async disconnect(): Promise<void> {
    this.isReading = false;

    // reader는 readLoop의 finally에서 이미 releaseLock 되었을 수 있으므로
    // 존재 여부를 안전하게 확인하면서 정리한다.
    const currentReader = this.reader;
    if (currentReader) {
      try {
        await currentReader.cancel().catch(() => {});
        // releaseLock은 이미 해제되었을 수 있음
        try {
          currentReader.releaseLock();
        } catch {
          // ignore if already released
        }
      } catch (error) {
        console.error("Error closing reader:", error);
      } finally {
        this.reader = null;
      }
    }

    if (this.writer) {
      try {
        await this.writer.close();
        try {
          this.writer.releaseLock();
        } catch {
          // ignore if already released
        }
      } catch (error) {
        console.error("Error closing writer:", error);
      }
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (error) {
        console.error("Error closing port:", error);
      }
      this.port = null;
    }
  }

  isConnected(): boolean {
    return this.port !== null && this.reader !== null;
  }
}
