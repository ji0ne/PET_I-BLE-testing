import React, { useEffect, useState } from "react";
import { UserProvider } from './src/hooks/useUserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainPage from "./src/components/MainPage";
import { ActivityIndicator, View, Text } from "react-native";
import BleManager from "react-native-ble-manager";
import Toast from 'react-native-toast-message';

function App() {
  // 상태 관리: BLE Manager 초기화 여부
  const [isBleInitialized, setIsBleInitialized] = useState(false);

  useEffect(() => {
    // Bluetooth 활성화 여부 체크
    BleManager.start({ showAlert: false })
      .then(() => {
        setIsBleInitialized(true); // 초기화 완료
        Toast.show({
          type: 'success',
          text1: 'BLE Manager',
          text2: 'BLE Manager이 성공적으로 시작되었습니다.',
        });
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `시작부터 문제 발생: ${error.message}`,
        });
      });
  }, []);

  if (!isBleInitialized) {
    // BLE 초기화 중일 때 로딩 화면
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>BLE Manager 초기화 중...</Text>
      </View>
    );
  }

  return ( // BLE 초기화 성공 시 표시 ( 메인페이지 랜더링 )
    <UserProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <MainPage/>
        <Toast /> 
      </SafeAreaView>
    </UserProvider>
  );
}

export default App;
