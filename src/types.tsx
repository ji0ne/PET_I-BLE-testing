
export interface Peripheral 
{
    id: string; // 장치의 고유 ID
    rssi: number; // 신호 강도 (Received Signal Strength Indicator)
    name?: string; // 장치의 이름 (선택 사항)
    advertising: AdvertisingData; // 장치의 광고 데이터
}
  
export interface AdvertisingData 
{
    isConnectable?: boolean; // 기기가 연결 가능한지 여부 (선택 사항)
    localName?: string; // 기기의 로컬 이름 (선택 사항)
    serviceUUIDs?: string[]; // 기기의 서비스 UUID 목록 (선택 사항)
}

export interface ConnectOptions 
{
    autoconnect?: boolean; // 자동 연결 여부 (Android 전용)
    phy?: BleScanPhyMode; // PHY 모드 (Android 전용)
}

export enum BleScanPhyMode {
    LE_1M = 1,  // 1 Mbps
    LE_2M = 2,  // 2 Mbps
    LE_CODED = 3,  // Long Range
    ALL_SUPPORTED = 255,  // 모든 지원 PHY 모드
  }
  

export interface Characteristic {
    properties: {
      Broadcast?: "Broadcast";
      Read?: "Read";
      WriteWithoutResponse?: "WriteWithoutResponse";
      Write?: "Write";
      Notify?: "Notify";
      Indicate?: "Indicate";
    };
    characteristic: string; // 특성 UUID
    service: string; // 서비스 UUID
    descriptors?: Descriptor[]; // 특성에 대한 설명자 (선택 사항)
  }
  
  export interface Descriptor 
  {
    value: string; // 설명자의 값
    uuid: string; // 설명자의 UUID
  }
  
  export interface BleManagerDidUpdateValueForCharacteristicEvent {
    readonly characteristic: string; // 특성 UUID
    readonly peripheral: string; // 기기 ID
    readonly service: string; // 서비스 UUID
    readonly value: number[]; // 데이터 값 (숫자 배열)
  }
  
  
