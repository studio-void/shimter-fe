// 아두이노 블루투스 연결 및 데이터 수신

export class ArduinoBluetooth {
  private device: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private dataBuffer: string = ""; // 데이터 버퍼 (청크 단위 수신 대응)
  private onDataReceived?: (data: {
    moisture: number; // 토양 수분 (0-100%)
    temperature: number; // 온도 (°C)
    humidity: number; // 습도 (%)
    illuminance: number; // 조도 (0-1023, 낮을수록 밝음)
  }) => void;

  async connect(): Promise<void> {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not supported in this browser");
      }

      // SHIMTER 장치 연결
      // 여러 방법으로 시도
      let device: BluetoothDevice;

      try {
        // 방법 1: 장치 이름으로 필터링 시도
        device = await navigator.bluetooth.requestDevice({
          filters: [{ name: "SHIMTER" }],
          optionalServices: [
            "battery_service",
            "0000ffe0-0000-1000-8000-00805f9b34fb", // HC-05, HC-06
            "00001101-0000-1000-8000-00805f9b34fb", // Serial Port Profile (SPP)
          ],
        });
      } catch (nameFilterError) {
        console.log("장치 이름 필터 실패, 모든 장치 허용 시도...");
        try {
          // 방법 2: 모든 장치 허용
          device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [
              "battery_service",
              "0000ffe0-0000-1000-8000-00805f9b34fb",
              "00001101-0000-1000-8000-00805f9b34fb",
            ],
          });
        } catch (allDevicesError) {
          // 방법 3: 서비스 UUID로 필터링 시도
          console.log("모든 장치 허용 실패, 서비스 UUID 필터 시도...");
          device = await navigator.bluetooth.requestDevice({
            filters: [{ services: ["0000ffe0-0000-1000-8000-00805f9b34fb"] }],
            optionalServices: [
              "battery_service",
              "0000ffe0-0000-1000-8000-00805f9b34fb",
              "00001101-0000-1000-8000-00805f9b34fb",
            ],
          });
        }
      }

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("Failed to connect to GATT server");
      }

      this.device = server;

      // 블루투스 시리얼 서비스 찾기
      // 먼저 사용 가능한 모든 서비스 탐색
      console.log("사용 가능한 서비스 탐색 중...");
      const allServices = await server.getPrimaryServices();
      console.log(`발견된 서비스 수: ${allServices.length}`);

      let service: BluetoothRemoteGATTService | null = null;
      let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

      // 일반적인 블루투스 시리얼 서비스 UUID 목록
      const serialServiceUUIDs = [
        "0000ffe0-0000-1000-8000-00805f9b34fb", // HC-05, HC-06
        "00001101-0000-1000-8000-00805f9b34fb", // Serial Port Profile (SPP)
      ];

      // 먼저 알려진 서비스 UUID로 시도
      for (const serviceUUID of serialServiceUUIDs) {
        try {
          service = await server.getPrimaryService(serviceUUID);
          console.log(`서비스 발견: ${serviceUUID}`);

          // 일반적인 특성 UUID 시도
          try {
            characteristic = await service.getCharacteristic(
              "0000ffe1-0000-1000-8000-00805f9b34fb"
            );
            console.log(`특성 발견: 0000ffe1-0000-1000-8000-00805f9b34fb`);
            break;
          } catch {
            // 특성 UUID가 다를 수 있으므로 모든 특성 탐색
            const characteristics = await service.getCharacteristics();
            console.log(
              `서비스 ${serviceUUID}의 특성 수: ${characteristics.length}`
            );

            if (characteristics.length > 0) {
              // 읽기/알림 가능한 특성 찾기
              characteristic =
                characteristics.find(
                  (char) =>
                    char.properties.read ||
                    char.properties.notify ||
                    char.properties.indicate
                ) || characteristics[0];

              if (characteristic) {
                console.log(`특성 발견: ${characteristic.uuid}`);
                break;
              }
            }
          }
        } catch (error) {
          console.log(`서비스 ${serviceUUID}를 찾을 수 없음`);
          continue;
        }
      }

      // 알려진 UUID로 실패하면 모든 서비스 탐색
      if (!service || !characteristic) {
        console.log("알려진 서비스 UUID로 실패, 모든 서비스 탐색 중...");

        for (const svc of allServices) {
          console.log(`서비스 확인: ${svc.uuid}`);
          const characteristics = await svc.getCharacteristics();
          console.log(`  특성 수: ${characteristics.length}`);

          // 읽기/알림 가능한 특성 찾기
          const foundChar = characteristics.find(
            (char) =>
              char.properties.read ||
              char.properties.notify ||
              char.properties.indicate
          );

          if (foundChar) {
            service = svc;
            characteristic = foundChar;
            console.log(
              `사용 가능한 서비스/특성 발견: ${svc.uuid} / ${foundChar.uuid}`
            );
            break;
          }
        }
      }

      if (!service || !characteristic) {
        throw new Error(
          "시리얼 통신을 위한 서비스나 특성을 찾을 수 없습니다. " +
            "발견된 서비스: " +
            allServices.map((s) => s.uuid).join(", ")
        );
      }

      this.characteristic = characteristic;

      // 데이터 수신 리스너 설정
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener("characteristicvaluechanged", () => {
        // 이벤트 발생 시 저장된 characteristic에서 값 읽기
        if (this.characteristic) {
          this.characteristic
            .readValue()
            .then((value) => {
              if (value) {
                this.handleData(value);
              }
            })
            .catch((err) => {
              console.error("Error reading characteristic value:", err);
            });
        }
      });
    } catch (error) {
      console.error("Bluetooth connection error:", error);

      // 더 자세한 에러 메시지 제공
      if (error instanceof Error) {
        const errorMsg = error.message;

        if (
          errorMsg.includes("Unsupported device") ||
          errorMsg.includes("NetworkError")
        ) {
          throw new Error(
            "HC-05는 클래식 블루투스 모듈로 Web Bluetooth API에서 지원되지 않습니다.\n\n" +
              "해결 방법:\n" +
              "1. BLE 모듈로 교체 (ESP32, HM-10, nRF51822 등)\n" +
              "2. 중간 서버 사용 (Node.js 브릿지 서버)\n" +
              "3. Web Serial API 사용 (USB 케이블 연결 필요)\n\n" +
              "Web Bluetooth API는 BLE(Bluetooth Low Energy) 장치만 지원합니다."
          );
        } else if (errorMsg.includes("No device selected")) {
          throw new Error("장치 선택이 취소되었습니다.");
        } else if (errorMsg.includes("GATT")) {
          throw new Error(
            "GATT 서버 연결 실패: " +
              errorMsg +
              "\n장치가 BLE를 지원하는지 확인해주세요."
          );
        }
      }

      throw error;
    }
  }

  private handleData(value: DataView): void {
    try {
      const decoder = new TextDecoder();
      const text = decoder.decode(value);

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

              this.onDataReceived?.(data);
            }
          }
        } catch (error) {
          console.error("Error parsing sensor data:", error, "Line:", line);
        }
      }
    } catch (error) {
      console.error("Error decoding data:", error);
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

  async disconnect(): Promise<void> {
    if (this.characteristic) {
      await this.characteristic.stopNotifications();
    }
    if (this.device) {
      this.device.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }

  isConnected(): boolean {
    return this.device?.connected ?? false;
  }
}
