import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, View, Alert, PermissionsAndroid, Platform, NativeEventEmitter, NativeModules, Modal, TouchableOpacity, FlatList, ScrollView } from "react-native";
import BleManager from 'react-native-ble-manager';
import Toast from "react-native-toast-message";

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  printData: {
    width: '100%',
    height: '80%',
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  deviceName: {
    width: '100%',
    height: '10%',
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center'
  },
  connect: {
    width: '100%',
    height: '10%',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  deviceNameText: {
    color: 'black'
  },
  button: {
    padding: 10,
    backgroundColor: 'blue',
    margin: 5,
    borderRadius: 5
  },
  buttonText: {
    color: 'white',
    textAlign: 'center'
  },
  selectedDeviceName: {
    color: 'blue'
  }
});

interface Device {
  id: string;
  name: string;
}

// 권한 요청 함수
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const grantedLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to find BLE devices.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      const grantedBluetoothScan = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Bluetooth Scan Permission',
          message: 'We need access to Bluetooth scan to find BLE devices.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      const grantedBluetoothConnect = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        {
          title: 'Bluetooth Connect Permission',
          message: 'We need access to Bluetooth connect to use BLE devices.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (
        grantedLocation !== PermissionsAndroid.RESULTS.GRANTED ||
        grantedBluetoothScan !== PermissionsAndroid.RESULTS.GRANTED ||
        grantedBluetoothConnect !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        Alert.alert('Permission Denied', 'You need to grant location and Bluetooth permissions to use BLE.');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

// Connect 컴포넌트
export function Connect({ onDeviceSelected, onDataReceived, selectedDevice }: { onDeviceSelected: (deviceName: string) => void, onDataReceived: (data: string) => void, selectedDevice: Device | null }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    // BLE 초기화 및 권한 요청
    BleManager.start({ showAlert: false });
    requestPermissions();

    // 이벤트 핸들러
    const handleDiscover = (device: any) => {
      setDevices(prevDevices => {
        if (!prevDevices.find(d => d.id === device.id)) {
          const newDevice: Device = { id: device.id, name: device.name || 'Unknown Device' };
          return [...prevDevices, newDevice];
        }
        return prevDevices;
      });
    };

    const handleStopScan = () => {
      console.log('Scan stopped');
    };

    const handleUpdateValueForCharacteristic = (data: any) => {
      // 데이터를 수신하면 onDataReceived 콜백을 통해 전달
      const receivedData = data.value.map((byte: number) => String.fromCharCode(byte)).join('');
      onDataReceived(receivedData);
    };

    const discoverListener = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscover);
    const stopScanListener = bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    const updateValueListener = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      discoverListener.remove();
      stopScanListener.remove();
      updateValueListener.remove();
    };
  }, [onDataReceived]);

  const handleDeviceSelect = (deviceId: string) => {
    const selected = devices.find(d => d.id === deviceId);
    if (selected) {
      onDeviceSelected(selected.name);
    }
    setModalVisible(false);
  };

  const handleDataReceive = async () => {
    if (selectedDevice) {
      try {
        await BleManager.connect(selectedDevice.id);
        Alert.alert("Connected", `Connected to ${selectedDevice.name}`);
        
        const peripheralInfo = await BleManager.retrieveServices(selectedDevice.id);
        Toast.show({
          type: 'success',
          text1: selectedDevice.name,
          text2: `${selectedDevice.name}과 성공적으로 연결되었습니다.`,
        });
        
        // 데이터 수신 시작
        setIsReceiving(true);
        // 수신 중 데이터 읽기 설정 (구성에 따라 변경)
        // 예: await BleManager.startNotification(selectedDevice.id, SERVICE_UUID, CHARACTERISTIC_UUID);
      } catch (error) {
        Alert.alert("Connection Error", "Failed to connect to device.");
      }
    }
  };

  return (
    <View style={styles.connect}>
      <Button
        title="근처 디바이스"
        onPress={() => {
          setDevices([]); // 스캔 시작 시 기존 장치 리스트 초기화
          BleManager.scan([], 5, true);
          setModalVisible(true); // 모달 창 열기
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Select a Device</Text>
            <FlatList
              data={devices}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleDeviceSelect(item.id)} style={styles.deviceItem}>
                  <Text style={styles.deviceNameText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Button title={isReceiving ? "수신 중..." : "데이터 수신"} onPress={handleDataReceive} disabled={!selectedDevice || isReceiving} />
    </View>
  );
}

export function DeviceName({ deviceName }: { deviceName: string }) {
  return (
    <View style={styles.deviceName}>
      <Text style={styles.selectedDeviceName}>{deviceName || "연결된 디바이스의 이름"}</Text>
    </View>
  );
}

export function PrintData({ receivedData }: { receivedData: string[] }) {
  return (
    <View style={styles.printData}>
      <ScrollView>
        {receivedData.length > 0 ? (
          receivedData.map((data, index) => (
            <Text key={index} style={{ color: "white", marginBottom: 5 }}>{data}</Text>
          ))
        ) : (
          <Text style={{ color: "white" }}>수신한 데이터가 표시되는 공간입니다</Text>
        )}
      </ScrollView>
    </View>
  );
}