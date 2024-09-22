import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import { TouchableRipple } from 'react-native-paper';
import 'react-native-reanimated';
import {
  Button,
  StyleSheet,
  Text,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  NativeEventEmitter,
  NativeModules,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
  NativeAppEventEmitter,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import Toast from 'react-native-toast-message';
import RippleEffect from '../components/RippleEffect';
import { fonts, fontSize } from '../utils/fonts';
import { colors } from '../utils/colors';
import { HUMIDITY_UUID, SERVICE_UUID, STATUS_UUID, TEMPERATURE_UUID } from '../Bluetooth/BleConstants';

const ConnectDevice = () => {

  let deviceAdvertiseUUID = '';

  const [isScanning, setScanning] = useState(false);
  const [bleDevices, setBluetoothDevices] = useState([]);

  //라이브러리에서 지원하는 네이티브모듈
  const BleManagerModule = NativeModules.BleManager; 

  //이벤트 수신하는 객체 
  const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

  const [temperature, setTemperature] = useState<string | null>(null);
  const [humidity, setHumidity] = useState<string | null>(null);
  const [currentDevice, setCurrentDevice] = useState<any>(null);

  const [updateValueListener, setUpdateValueListener] = useState<any>(null);

  // 여기까지 상태관리변수모음 

  useEffect(() => { //ConnectDevice 랜더링 시 실행 
    //블투기능 사용을 위한 초기설정수행 
    //showAlert가 false : 블루투스가 비활성화된 경우에 자동으로 사용자에게 알림을 표시하지 않도록 함
    //기본값은 true , 활성화 요청 알림 표시됨 
    BleManager.start({showAlert: false})  
      .then(() => {
        // 성공 시
        Toast.show({
          type: 'success',
          text1: '블루투스가 이미 활성화되었거나 사용자가 활성화하였습니다.',
        });
      })
      .catch(error => { 
        Toast.show({
          type: 'error',
          text1: '사용자가 블루투스 활성화를 거부했습니다.',
        });
      });
  }, []); // 빈배열 == 한번만실행 


  useEffect(() => {
    // 사용자가 블투를 활성화하도록 요청, Promise 반환
    BleManager.enableBluetooth() 
      .then(() => { //프로미스 resolve
        Toast.show({
          type: 'success',
          text1: '블루투스가 활성화되었습니다.',
        });

        // 블루투스 활성화 시 권한 요청
        requestPermisson();
      })
      .catch(error => { //프로미스 reject
        Toast.show({
          type: 'error',
          text1: '블루투스를 활성화하지 못했습니다.',
        });
      });
  }, []);

// 모바일에서 블루투스 활성화/ 비활성화 체크 


// 모든 권한이 성공적으로 부여될때까지 (프로미스 객체가 Resolve상태가될때까지)
// await으로 기다렸다가 성공하면 프로미스객체를 반환 
//권한 요청이 완료되면 granted 에 결과를 저장
// 권한이 허용되면 startScanning 메서드 호출 (블투장치스캔시작)
const requestPermisson = async () => { 
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  if (granted) {
    startScanning();
  }
}; // end of requestPermission

// 컴포넌트 랜더링 시 블루투스 스캔 중지 이벤트리스너를 등록하고
// 스캔이 중지되면 코드를 수행하고 등록했던 리스너 제거
  useEffect(() => { 
    let stopListener = 
    BleManagerEmitter.addListener('BleManagerStopScan', () => 
      {
        setScanning(false); //isScanning = false;
        handleGetConnectedDevices(); 
        console.log("bleManager scan Stopped");
      });

    return () => stopListener.remove();
  }, []);


  //스캔 중지 / 연결 버튼 클릭 시 호출 
/*  const handleGetConnectedDevices = () => {
    //발견된 블루투스 기기들의 목록을 반환하는 프로미스 생성
    // => 스캔된 기기들의 정보 반환 
    BleManager.getDiscoveredPeripherals().then((result: any) => {
      if (result.length === 0) {
        console.log("no device found");
        startScanning(); // 찾은 기기 없으면 다시 스캔시작 
      } else {
        //이름없는 (연결불가) 기기 제외
        const allDevices = result.filter((item: any) => item.name !== null);
        // 제외된 기기 외 모든디바이스 배열을 상태로 반환
        setBluetoothDevices(allDevices);
      
      }
    });
  }; // end of handleGetConnectedDevices */

  /*class BLETemperature:
    def __init__(self, ble, name="Buds2"):  # name을 "Buds2"로 설정
        self._ble = ble  이 부분을 수정하면 peti 기기만 받을수있음*/ 

  const handleGetConnectedDevices = () => {

    BleManager.getDiscoveredPeripherals().then((result:any) => {
      if (result.length === 0)
      {
        console.log("주변에 서치된 기기가 없습니다.");
        startScanning();
        
      } else 
      {
        //null이 아님 && 키워드 포함하는 기기만 필터링 
        const filteredDevices = result.filter((item : any) =>
          item.name && item.name.includes("Bu"));
        if(filteredDevices.length > 0)
        {
          setBluetoothDevices(filteredDevices);
        } else 
        {
            console.log("펫아이 디바이스 없삼;;");
            startScanning();
        }
      }

    });
  };


  const startScanning = () => {
    if (!isScanning) {
      BleManager.scan([], 7, true)
        .then(() => {
          // Success code
          console.log('Scan started');

          setScanning(true);
        })
        .catch((error: any) => {
          Toast.show({
            type: 'error',
            text1: error,
          });
        });
    }
  }; // end of StartScan



  useEffect(() => {

  }, []);

  const readCharacteristicFromEvent =(data:any) => {
    const {service, characteristic, value} = data

    if(characteristic == TEMPERATURE_UUID)
    {
      const temperature = byteToString(value)
      setTemperature(temperature)
      console.log("temperature" , temperature)
    }

    if(characteristic == HUMIDITY_UUID)
      {
        const humidity = byteToString(value)
        setHumidity(humidity)
        console.log("humidity" , humidity)
      }
  }

  const byteToString = (bytes:any) =>
  {
    return String.fromCharCode(...bytes)
  }

  const onConnect = async (item: any, index : number) => {
    try {
      await BleManager.connect(item.id);
      console.log('Connected');
      setCurrentDevice(item);

      const result = await BleManager.retrieveServices(item.id);
      onServiceDiscovered(result, item);

      const updateValueListener = BleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        readCharacteristicFromEvent
      );
      setUpdateValueListener(updateValueListener);

    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  useEffect(() => {
    return () => {
      if(updateValueListener) {
        updateValueListener.remove();
      }
    };
  }, [updateValueListener])

  // UUID 포맷 맞추기
  const formatUUID = (uuid: string) => {
    return uuid.length === 4 ? `0000${uuid}-0000-1000-8000-00805f9b34fb` : uuid.toLowerCase();
  };



  const onServiceDiscovered = (result: any, item: any) => {
   // const services = result.services;
    //const characteristics = result.characteristics;

    const {services, characteristics} = result;

    // Log 서비스와 특성 정보
    //console.log('Services:', services);
    console.log('Characteristics:', characteristics);

    services.forEach((service: any) => {
      const serviceUUID = formatUUID(service.uuid);

      onChangeCharacteristics(serviceUUID, characteristics, item);
    });
  }; // end of onServiceDiscovered

  const onChangeCharacteristics = (serviceUUID: any, result: any, item: any) => {
    result.forEach((characteristic: any) => {
      const characteristicUUID = formatUUID(characteristic.characteristic);
      
      if(characteristicUUID === TEMPERATURE_UUID || characteristicUUID === HUMIDITY_UUID)
      {
          BleManager.startNotification(item.id, serviceUUID, characteristicUUID)
            .then(()=>{
                console.log("notification started");
          }).catch((error) =>{
              console.log("notification error");
          })
      }
 
    });
  }; //end of onChangeCharacteristics

  const onDisConnect = ()=>{
    BleManager.disconnect(currentDevice?.id).then(()=>{
      setCurrentDevice(null)
      console.log("disconnected");

      if (updateValueListener){
        updateValueListener.remove();
        setUpdateValueListener(null);
      }
    });
  };
  
  
  
  
  const renderItem = ({item, index}: any) => {
    return (
      <View style={styles.bleCard}>
        <Text style={styles.bleText}>{item.name}</Text>
        <TouchableOpacity onPress={() => item.id === currentDevice?.id ? onDisConnect() : onConnect(item, index)} style={styles.button}>
          <Text style={styles.btnTxt}>{currentDevice?.id ===item?.id?"Disconnect":"Connect"}연결하기</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isScanning ? <View style={styles.rippleView}>
        <RippleEffect />
      </View> : <View>
        <FlatList
          data={bleDevices}
          keyExtractor={(Item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>}
    </View>
  );
}; // end of ConnectDevice

export default ConnectDevice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue'
  },
  bleCard: {
    width: '90%',
    padding: 10,
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: 'yellow',
    elevation: 5,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rippleView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.font18,
    color: colors.text
  },
  btnTxt: {
    fontFamily: fonts.bold,
    fontSize: fontSize.font18,
    color: colors.white
  },
  button: {
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: colors.primary
  }
});
