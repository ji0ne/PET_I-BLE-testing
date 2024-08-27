import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from "react-native";
import { Connect, PrintData, DeviceName } from "../MainPage";

interface MainPageProps {
  isBleInitialized: boolean;
}

interface Device {
  id: string;
  name: string;
}


const MainPage: React.FC<MainPageProps> = ({ isBleInitialized }) => {
  const [deviceName, setDeviceName] = useState<string>('');
  const [dataLog, setDataLog] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null); // 추가된 상태

  const handleDataReceived = (data: string) => {
    setDataLog(prevData => [...prevData, data]);
  };

  const handleDeviceSelected = (deviceName: string, device: Device) => {
    setDeviceName(deviceName);
    setSelectedDevice(device); // 기기 선택 시 상태 업데이트
  };

  // BLE 초기화 여부에 따라 화면 표시
  if (!isBleInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text>BLE Manager가 초기화되지 않았습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <DeviceName deviceName={deviceName} />
        <PrintData receivedData={dataLog} />
        <Connect
          onDeviceSelected={(name: string) => handleDeviceSelected(name, selectedDevice!)}
          onDataReceived={handleDataReceived}
          selectedDevice={selectedDevice} // `selectedDevice` 속성 추가
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainPage;
