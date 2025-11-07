// 아두이노 블루투스 연결 및 데이터 수신

export class ArduinoBluetooth {
  private device: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onDataReceived?: (data: {
    temperature: number;
    humidity: number;
    illuminance: number;
  }) => void;

  async connect(): Promise<void> {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not supported in this browser");
      }

      // FIXME: 실제 아두이노 블루투스 모듈의 서비스 UUID로 변경 필요
      // 예: HC-05, HC-06, ESP32 등 모듈에 따라 UUID가 다를 수 있음
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["0000ffe0-0000-1000-8000-00805f9b34fb"] }],
        optionalServices: ["battery_service"],
      });

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("Failed to connect to GATT server");
      }

      this.device = server;

      // FIXME: 실제 아두이노 블루투스 모듈의 서비스 및 특성 UUID로 변경 필요
      const service = await server.getPrimaryService(
        "0000ffe0-0000-1000-8000-00805f9b34fb"
      );
      this.characteristic = await service.getCharacteristic(
        "0000ffe1-0000-1000-8000-00805f9b34fb"
      );

      // FIXME: 데이터 수신 방식 확인 필요
      // characteristicvaluechanged 이벤트를 사용할 경우 readValue() 대신
      // 이벤트의 value 속성을 직접 사용하는 것이 더 효율적일 수 있음
      // 데이터 수신 리스너 설정
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener("characteristicvaluechanged", () => {
        this.handleData();
      });
    } catch (error) {
      console.error("Bluetooth connection error:", error);
      throw error;
    }
  }

  private async handleData(): Promise<void> {
    if (!this.characteristic) {
      return;
    }

    try {
      const value = await this.characteristic.readValue();
      if (!value) return;

      // FIXME: 실제 아두이노에서 보내는 데이터 형식에 맞게 파싱 로직 수정 필요
      // 예: "T:25.5,H:60.2,L:500\n" 또는 JSON 형식 등
      // 실제 아두이노 코드에서 보내는 형식을 확인하고 그에 맞게 수정
      const decoder = new TextDecoder();
      const text = decoder.decode(value);
      const lines = text.trim().split("\n");

      for (const line of lines) {
        if (line.length === 0) continue;

        try {
          // FIXME: 실제 아두이노 데이터 형식에 맞게 정규식 또는 파싱 로직 수정
          // 예시: "T:25.5,H:60.2,L:500" 또는 JSON 형식
          const tempMatch = line.match(/T:([\d.]+)/);
          const humMatch = line.match(/H:([\d.]+)/);
          const luxMatch = line.match(/L:([\d.]+)/);

          if (tempMatch && humMatch && luxMatch) {
            const data = {
              temperature: parseFloat(tempMatch[1]),
              humidity: parseFloat(humMatch[1]),
              illuminance: parseFloat(luxMatch[1]),
            };

            this.onDataReceived?.(data);
          }
        } catch (error) {
          console.error("Error parsing sensor data:", error);
        }
      }
    } catch (error) {
      console.error("Error reading characteristic value:", error);
    }
  }

  setDataHandler(
    handler: (data: {
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
