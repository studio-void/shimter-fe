// 아두이노 시리얼 통신 (Web Serial API)

export class ArduinoSerial {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private dataBuffer: string = ""; // 데이터 버퍼 (청크 단위 수신 대응)
  private isReading: boolean = false;
  private onDataReceived?: (data: {
    moisture: number; // 토양 수분 (0-100%)
    temperature: number; // 온도 (°C)
    humidity: number; // 습도 (%)
    illuminance: number; // 조도 (0-1023, 낮을수록 밝음)
  }) => void;

  async connect(): Promise<void> {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API is not supported in this browser");
      }

      // 시리얼 포트 선택 및 연결
      this.port = await navigator.serial.requestPort();

      // 아두이노 코드에서 사용하는 보드레이트: 38400
      await this.port.open({ baudRate: 38400 });

      // 읽기/쓰기 스트림 설정
      const textDecoder = new TextDecoder();

      // 쓰기 스트림
      if (this.port.writable) {
        this.writer = this.port.writable.getWriter();
      }

      // 읽기 스트림
      if (this.port.readable) {
        this.reader = this.port.readable.getReader();
        this.isReading = true;

        console.log("[Serial] ✅ 시리얼 포트 연결 성공");
        console.log("[Serial] 보드레이트: 38400");
        console.log("[Serial] 데이터 수신 대기 중...");

        // 데이터 읽기 루프
        this.readLoop(textDecoder);
      } else {
        throw new Error("시리얼 포트를 읽을 수 없습니다.");
      }
    } catch (error) {
      console.error("Serial connection error:", error);

      // 더 자세한 에러 메시지 제공
      if (error instanceof Error) {
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
    if (!this.reader) return;

    console.log("[Serial] 📡 데이터 읽기 루프 시작");

    try {
      while (this.isReading && this.reader) {
        const { value, done } = await this.reader.read();

        if (done) {
          console.log("[Serial] 읽기 완료 (done=true)");
          break;
        }

        if (value) {
          // 바이트 데이터를 텍스트로 디코딩
          const text = decoder.decode(value, { stream: true });
          this.processData(text);
        }
      }
    } catch (error) {
      if (this.isReading) {
        console.error("[Serial] ❌ 읽기 에러:", error);
      }
    }
  }

  private processData(text: string): void {
    // 디버깅: 원시 데이터 출력
    console.log("[Serial] 원시 데이터 수신:", JSON.stringify(text));

    // 버퍼에 추가 (데이터가 청크 단위로 올 수 있음)
    this.dataBuffer += text;

    // 줄바꿈 문자로 분리하여 완전한 라인 처리
    const lines = this.dataBuffer.split("\n");

    // 마지막 줄은 완전하지 않을 수 있으므로 버퍼에 보관
    this.dataBuffer = lines.pop() || "";

    for (const line of lines) {
      if (line.length === 0) continue;

      // 디버깅: 각 라인 출력
      console.log("[Serial] 처리 중인 라인:", JSON.stringify(line));

      try {
        // 아두이노에서 보내는 CSV 형식: MOIST,TEMP,HUMI,CDS
        // 예: "050,25,60,500\n"
        const parts = line.trim().split(",");

        console.log("[Serial] 파싱된 부분:", parts, "개수:", parts.length);

        if (parts.length === 4) {
          const moisture = parseInt(parts[0], 10); // 토양 수분 (0-100%)
          const temperature = parseInt(parts[1], 10); // 온도 (°C)
          const humidity = parseInt(parts[2], 10); // 습도 (%)
          const illuminance = parseInt(parts[3], 10); // 조도 (0-1023)

          console.log("[Serial] 파싱된 값:", {
            moisture,
            temperature,
            humidity,
            illuminance,
          });

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

            console.log("[Serial] ✅ 유효한 센서 데이터:", data);
            console.log("[Serial] 콜백 호출 여부:", !!this.onDataReceived);

            this.onDataReceived?.(data);
          } else {
            console.warn("[Serial] ⚠️ 유효하지 않은 값:", {
              moisture,
              temperature,
              humidity,
              illuminance,
            });
          }
        } else {
          console.warn(
            "[Serial] ⚠️ CSV 형식이 아닙니다. 예상: 4개, 실제:",
            parts.length,
            "부분"
          );
        }
      } catch (error) {
        console.error("[Serial] ❌ 파싱 에러:", error, "Line:", line);
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
    console.log("[Serial] 데이터 핸들러 설정됨");
    this.onDataReceived = handler;
  }

  async disconnect(): Promise<void> {
    this.isReading = false;

    if (this.reader) {
      try {
        await this.reader.cancel();
        await this.reader.releaseLock();
      } catch (error) {
        console.error("Error closing reader:", error);
      }
      this.reader = null;
    }

    if (this.writer) {
      try {
        await this.writer.close();
        await this.writer.releaseLock();
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
