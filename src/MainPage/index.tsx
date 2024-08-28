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

const ConnectDevice = () => {
  const [isScanning, setScanning] = useState(false);
  const [bleDevices, setDevices] = useState([]);

  const BleManagerModule = NativeModules.BleManager
  const BleManagerEmitter = new NativeEventEmitter(BleManagerModule)

  const [temperature,setTemperature] = useState<string | null>(null);
  const [currentDevice,setCurrentDevice] = useState<any>(null);

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
        const allDevices= result.filter((item:any)=>item.name !== null)
        setDevices(allDevices)
      }

    });
    
  } //end of handleGetConnectedDevices

  const onConnect =async(item:any)=>
  {
    try {
      await BleManager.connect(item.id);
      setCurrentDevice(item)

      const result = await BleManager.retrieveServices(item.id);
      console.log('result', result);
    } catch (error) {
      
    }
  }

  const renderItem = ({item, index }: any) => {
    return(
      <View style = {styles.bleCard}>
          <Text style = {styles.bleText}>{item.name}</Text>
          <TouchableOpacity onPress={()=>onConnect(item)} style ={styles.button}>
            <Text style = {styles.btnTxt}>연결하기</Text>
          </TouchableOpacity>
      </View>
    )
  }


  return (
    <View style={styles.container}>
    {isScanning?<View style = {styles.rippleView}>
      <RippleEffect/>
      </View>:<View>
        
        <FlatList
        
          data = {bleDevices}
          keyExtractor={(Item, index)=>index.toString()}
          renderItem={renderItem}
          />
          </View>}  
      
    </View>
  );
}; // end of ConnectDevice

export default ConnectDevice;

const styles = StyleSheet.create({
  container:
  {
    flex : 1 ,
    backgroundColor : 'blue'
  },
  bleCard:{
    width : '90%',
    padding: 10,
    alignSelf :'center',
    marginVertical:10,
    backgroundColor : 'yellow',
    elevation:5,
    borderRadius:5,
    flexDirection : 'row',
    justifyContent : 'space-between'
  },
  rippleView :
  {
    flex : 1,
    justifyContent : 'center',
    alignItems : 'center'
  },
  bleText :
  {
    fontFamily : fonts.bold,
    fontSize : fontSize.font18,
    color : colors.text
  },
  btnTxt :
  {
    fontFamily : fonts.bold,
    fontSize : fontSize.font18,
    color : colors.white

  },
  button :
  {
    width : 100,
    height : 40,
    alignItems : 'center',
    justifyContent : 'center',
    borderRadius : 5,
    backgroundColor : colors.primary
  }
});
