import React, {useState, useEffect} from 'react';
import {
  Button,
  StyleSheet,
  Text,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
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

const ConnectDevice = () => {
  const [isScanning, setScanning] = useState(false);
  const [bleDevices, setDevices] = useState([]);

  const BleManagerModule = NativeModules.BleManager
  const BleManagerEmitter = new NativeEventEmitter(BleManagerModule)

  useEffect(() => {
    BleManager.start({showAlert: false})
      .then(() => {
        //성공 시
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
  }, []);

  useEffect(() => {
    BleManager.enableBluetooth()
      .then(() => {
        Toast.show({
          type: 'success',
          text1: '블루투스가 활성화되었습니다 .',
        });

        //블루투스 활성화 시 권한 요청
        requestPermisson();
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: '블루투스를 활성화하지 못했습니다',
        });
      });
  }, []);

  useEffect(()=>{
    let stopListener=BleManagerEmitter.addListener('BleManagerStopScan',
      ()=>{
          setScanning(false) 
          handleGetConnectedDevices()
          console.log("bleManager scan Stopped")
      })

      return()=> stopListener.remove()
  },[])

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
  }; //end of requestPermission

  const startScanning = () => {
    if (!isScanning) {
      BleManager.scan([], 10, true)
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
  }; //end of StartScan

  const handleGetConnectedDevices = () => {
    BleManager.getDiscoveredPeripherals().then((result:any) => {
      if(result.length ===0)
      {
        console.log("no device found")
        startScanning()
      }
      else{
        console.log("results" , JSON.stringify(result))
        const allDevices= result.filter((item:any)=>item.name === null)
        setDevices(allDevices)
      }

    });
    
  }
/*      {isScanning?<View>
        <RippleEffect/>
        </View>:<View>
          
          <FlatList
          
          data={bleDevices}
          keyExtractor={(item,index)=>index.toString()}
          renderItem={renderItem}

          />
          </View>} */

  return (
    <View style={styles.container}>

    </View>
  );
}; // end of ConnectDevice

export default ConnectDevice;

const styles = StyleSheet.create({
  container:
  {
    flex : 1 ,
    backgroundColor : 'blue'
  }
});
